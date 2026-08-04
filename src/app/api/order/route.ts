import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

async function postHandler(req: Request) {
  try {
    const body = await req.json();

    const orderId = `TSON-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expiredTime = Math.floor(now.getTime() / 1000) + 86400; // 24 jam

    // Extract dynamic account inputs if provided
    const accountInputs = body.inputs || body.account_data || body.accountData || {};
    const primaryId = accountInputs.id || accountInputs.user_id || accountInputs.uid || accountInputs.email || accountInputs.username || accountInputs.riot_id || body.id_games || body.idGames || body.id || "-";
    const serverVal = accountInputs.server || body.server_games || body.serverGames || body.server || "";

    // Merge any loose account fields from body if not in accountInputs
    const fullAccountData = { ...accountInputs };
    if (body.id && !fullAccountData.id) fullAccountData.id = body.id;
    if (body.server && !fullAccountData.server) fullAccountData.server = body.server;

    const newOrderData = {
      orderId,
      gameSlug: body.game_slug || body.slug || "mobile-legends",
      productId: body.product_id || body.productId || "SKU-001",
      productTitle: body.product_title || body.productTitle || "Nominal Topup",
      idGames: String(primaryId),
      serverGames: String(serverVal),
      nickname: body.nickname || "Player",
      quantity: Number(body.quantity || 1),
      price: body.price ? String(body.price) : "0",
      totalPrice: body.total_price || body.totalPrice ? String(body.total_price || body.totalPrice) : "0",
      fee: body.fee ? String(body.fee) : "0",
      discountPrice: body.discount_price || body.discountPrice ? String(body.discount_price || body.discountPrice) : "0",
      promoPrice: body.promo_price || body.promoPrice ? String(body.promo_price || body.promoPrice) : "0",
      paymentMethodId: body.payment_method_id || body.paymentMethodId || "qris",
      paymentName: body.payment_name || body.paymentName || "QRIS (All Bank & E-Wallet)",
      paymentCode: body.payment_code || body.paymentCode || "QRIS",
      whatsapp: body.whatsapp || "",
      email: body.email || "",
      promoCode: body.promo_code || body.promoCode || "",
      promoDiscount: body.promo_discount ? String(body.promo_discount) : "0",
      paymentStatus: "pending",
      buyStatus: "pending",
      expiredTime,
      accountData: fullAccountData,
    };

    // Simpan ke database Supabase (Wajib sukses di produksi)
    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        await db.insert(orders).values(newOrderData);
      } catch (dbErr: any) {
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

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: {
        order_id: orderId,
        payment_code: newOrderData.paymentCode,
        payment_name: newOrderData.paymentName,
        total_price: Number(newOrderData.totalPrice),
        payment_status: "pending",
        expired_time: expiredTime,
      },
      redirect_url: `/invoice/${orderId}`,
    }, { status: 200 });
  } catch (error: any) {
    logger.error("order creation failed", { error });
    return NextResponse.json({
      success: false,
      message: "Gagal memvalidasi atau memproses pesanan",
      error: error?.message,
    }, { status: 500 });
  }
}

export const POST = withRequestLogging(postHandler);
