import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db, orders, sqlClient } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { authOptions } from "@/lib/auth";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { callValidatePromo, getProductUnitPrice, computeDiscount } from "@/lib/promo";
import { createPayment, getPaymentServiceBaseUrl } from "@/lib/payment-client";
import { OrderPaymentStatus, OrderBuyStatus } from "@/types/status";

const money = (v: any) => Math.max(0, Math.floor(Number(v ?? 0)));

/**
 * POST /api/order
 *
 * Primary checkout endpoint for creating top-up and marketplace purchase orders.
 *
 * Processing Steps:
 * 1. Resolves active user session and validates user ID against `public.users` table.
 * 2. Parses game item inputs (e.g. User ID, Server ID, Riot ID).
 * 3. Resolves product pricing, calculates discounts if promo code is supplied.
 * 4. Inserts new pending order record into PostgreSQL database (`orders` table).
 * 5. Calls external `payment-service` worker to create payment intent (QRIS / Virtual Account).
 *
 * @param req - Incoming Next.js API request containing checkout payload.
 * @returns JSON response with created order details and payment redirect/code info.
 */
async function postHandler(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOptions);
    const sessionUserId =
      typeof (session?.user as any)?.id === "string" ? (session?.user as any).id : null;

    const hasDb = Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL);
    const isUuid =
      sessionUserId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionUserId);

    // Hanya tautkan order ke user bila ada profile valid di public.users.
    // Google OAuth tak otomatis membuat profile → userId null agar order tak gagal FK.
    let safeUserId: string | undefined;
    if (isUuid && hasDb) {
      try {
        const found = await sqlClient<{ id: string }[]>`
          select id from public.users where id = ${sessionUserId} limit 1
        `;
        if (found[0]) safeUserId = sessionUserId;
      } catch (e) {
        logger.warn("userId lookup failed, order proceeds without owner", { error: e });
      }
    }

    const orderId = `TSON-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expiredTime = Math.floor(now.getTime() / 1000) + 86400; // 24 jam

    // Extract dynamic account inputs if provided
    const accountInputs = body.inputs || body.account_data || body.accountData || {};
    const primaryId =
      accountInputs.id ||
      accountInputs.user_id ||
      accountInputs.uid ||
      accountInputs.email ||
      accountInputs.username ||
      accountInputs.riot_id ||
      body.id_games ||
      body.idGames ||
      body.id ||
      "-";
    const serverVal =
      accountInputs.server || body.server_games || body.serverGames || body.server || "";

    // Merge any loose account fields from body if not in accountInputs
    const fullAccountData = { ...accountInputs };
    if (body.id && !fullAccountData.id) fullAccountData.id = body.id;
    if (body.server && !fullAccountData.server) fullAccountData.server = body.server;

    // ---- Re-validasi harga & promo server-side (R1/D) — jangan percaya harga client ----
    const quantity = Math.max(1, Math.floor(Number(body.quantity || 1)));
    const productId = String(body.product_id || body.productId || "");
    const promoCode = String(body.promo_code || body.promoCode || "")
      .trim()
      .toUpperCase();

    const unitPrice = await getProductUnitPrice(productId);
    const baseSubtotal =
      unitPrice !== null ? unitPrice * quantity : Number(body.price || 0) * quantity;
    let authoritativeDiscount = 0;
    let promoQuotaUsed = false;

    if (promoCode) {
      const validated = await callValidatePromo(promoCode, baseSubtotal);
      if (!validated.ok) {
        return NextResponse.json({ success: false, message: validated.message }, { status: 400 });
      }
      authoritativeDiscount = computeDiscount(baseSubtotal, validated);
      promoQuotaUsed = true;
    }

    // Harga final otoritatif per unit (setelah promo) & total server-side
    const discountedSubtotal = Math.max(0, baseSubtotal - authoritativeDiscount);
    const clientFee = money(body.fee || 0);
    const priorityTotal = money(discountedSubtotal + clientFee);
    const discountPrice = promoCode ? String(money(authoritativeDiscount)) : "0";

    const newOrderData = {
      orderId,
      userId: safeUserId,
      gameSlug: body.game_slug || body.slug || "mobile-legends",
      productId: body.product_id || body.productId || "SKU-001",
      productTitle: body.product_title || body.productTitle || "Nominal Topup",
      idGames: String(primaryId),
      serverGames: String(serverVal),
      nickname: body.nickname || "Player",
      quantity,
      price: body.price
        ? String(Number(body.price) > Number(discountedSubtotal) ? body.price : discountedSubtotal)
        : String(discountedSubtotal),
      totalPrice: String(priorityTotal),
      fee: body.fee ? String(body.fee) : "0",
      discountPrice,
      promoPrice:
        body.promo_price || body.promoPrice ? String(body.promo_price || body.promoPrice) : "0",
      paymentMethodId: body.payment_method_id || body.paymentMethodId || "qris",
      paymentName: body.payment_name || body.paymentName || "QRIS (All Bank & E-Wallet)",
      paymentCode: body.payment_code || body.paymentCode || "QRIS",
      whatsapp: body.whatsapp || "",
      email: body.email || "",
      promoCode,
      promoDiscount: promoCode ? discountPrice : "0",
      paymentStatus: OrderPaymentStatus.PENDING,
      buyStatus: OrderBuyStatus.PENDING,
      expiredTime,
      accountData: fullAccountData,
    };

    // R3: reserve kuota atomik SEBELUM insert order — jika kuota penuh saat itu juga
    // (race/oversell), tolak order tanpa menyimpan baris orfan. Rowcount 0 = quota habis.
    let promoQuotaReserved = false;
    if (hasDb && promoCode && promoQuotaUsed) {
      const quotaRes = await sqlClient`
        update public.promo_codes
        set used_count = used_count + 1
        where code = ${promoCode} and used_count < quota
        returning code
      `;
      if (quotaRes.length === 0) {
        logger.warn("promo quota exhausted at order time", { orderId, promoCode });
        return NextResponse.json(
          { success: false, message: `Kode promo ${promoCode} sudah habis digunakan` },
          { status: 400 },
        );
      }
      promoQuotaReserved = true;
    }

    // Simpan ke database Supabase (Wajib sukses di produksi)
    if (hasDb) {
      try {
        await db.insert(orders).values(newOrderData);
      } catch (dbErr: any) {
        // Rollback kuota yang sudah di-reserve agar order gagal tidak menghabiskan kuota.
        if (promoQuotaReserved) {
          try {
            await sqlClient`
              update public.promo_codes
              set used_count = greatest(used_count - 1, 0)
              where code = ${promoCode}
            `;
          } catch (rollbackErr: any) {
            logger.error("rollback promo quota failed", { orderId, error: rollbackErr });
          }
        }
        logger.error("Gagal menyimpan pesanan ke database", {
          orderId,
          error: dbErr,
        });
        return NextResponse.json(
          {
            success: false,
            message: "Gagal membuat pesanan. Terjadi kendala saat menyimpan ke database.",
            error: process.env.NODE_ENV === "development" ? dbErr?.message : undefined,
          },
          { status: 500 },
        );
      }
    }

    logger.info("order created", {
      orderId,
      gameSlug: newOrderData.gameSlug,
      totalPrice: Number(newOrderData.totalPrice),
    });

    // ---- Payment service worker (abstraction mock/pakasir, terpisah network) ----
    // Buat payment intent di worker; simpan hasil di gateway_response.
    // Jika gateway tidak dikonfigurasi / offline, order tetap berjalan (alur lama).
    let paymentIntent: Awaited<ReturnType<typeof createPayment>> = null;
    if (hasDb && getPaymentServiceBaseUrl()) {
      try {
        paymentIntent = await createPayment({
          orderId,
          amount: priorityTotal,
          description: `${newOrderData.productTitle} - ${primaryId}${serverVal ? ` (${serverVal})` : ""}`,
          customer: {
            name: newOrderData.nickname,
            whatsapp: newOrderData.whatsapp,
            email: newOrderData.email,
          },
          expiresInSeconds: 86400,
          returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/invoices/${orderId}`,
        });

        if (paymentIntent) {
          const isQris =
            paymentIntent.payment_method === "qris" || Boolean(paymentIntent.qr_string);
          await db
            .update(orders)
            .set({
              paymentCode: paymentIntent.payment_code,
              paymentCodeDisplay:
                paymentIntent.payment_code_display ??
                (isQris ? "QRIS" : `Virtual Account ${paymentIntent.payment_code}`),
              qrString: paymentIntent.qr_string ?? null,
              paymentMethodId: paymentIntent.payment_method || newOrderData.paymentMethodId,
              paymentName: paymentIntent.payment_method || newOrderData.paymentName,
              gatewayResponse: { ...paymentIntent },
              expiredTime: paymentIntent.expires_at,
            })
            .where(eq(orders.orderId, orderId));
          logger.info("payment intent created", {
            orderId,
            provider: paymentIntent.provider,
            paymentId: paymentIntent.payment_id,
            status: paymentIntent.status,
          });
        }
      } catch (e) {
        logger.warn("payment setup failed, order proceeds without gateway", {
          orderId,
          error: e,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pesanan berhasil dibuat",
        data: {
          order_id: orderId,
          payment_code: newOrderData.paymentCode,
          payment_name: newOrderData.paymentName,
          total_price: Number(newOrderData.totalPrice),
          payment_status: "pending",
          expired_time: paymentIntent?.expires_at ?? expiredTime,
          gateway: paymentIntent
            ? {
                provider: paymentIntent.provider,
                payment_id: paymentIntent.payment_id,
                payment_code: paymentIntent.payment_code,
                payment_url: paymentIntent.payment_url,
              }
            : null,
        },
        redirect_url: paymentIntent?.payment_url ?? `/invoice/${orderId}`,
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("order creation failed", { error });
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memvalidasi atau memproses pesanan",
        error: error?.message,
      },
      { status: 500 },
    );
  }
}

export const POST = withRequestLogging(postHandler);
