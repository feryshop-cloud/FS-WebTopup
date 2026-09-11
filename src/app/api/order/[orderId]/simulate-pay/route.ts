import { NextResponse } from "next/server";
import crypto from "crypto";
import { db, orders, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { getPaymentWebhookSecret } from "@/lib/payment-client";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

export const dynamic = "force-dynamic";

/**
 * POST /api/order/[orderId]/simulate-pay
 *
 * Simulates payment settlement for testing and development.
 * Guarded: Only permitted for dummy game / sandbox SKU (xld10) or non-production environment.
 */
async function postHandler(
  req: Request,
  context?: RouteContext<"/api/order/[orderId]/simulate-pay">,
) {
  try {
    const { orderId } = (await context?.params) ?? { orderId: undefined };
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID tidak ditemukan." },
        { status: 400 },
      );
    }

    const [order] = await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        gameSlug: orders.gameSlug,
        totalPrice: orders.totalPrice,
        paymentStatus: orders.paymentStatus,
        productSku: products.sku,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan." },
        { status: 404 },
      );
    }

    const isSandboxAllowed =
      process.env.NODE_ENV !== "production" ||
      order.gameSlug === "dummy-game" ||
      order.productSku?.toLowerCase() === "xld10";

    if (!isSandboxAllowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Simulasi pembayaran hanya diizinkan untuk produk sandbox / testing.",
        },
        { status: 403 },
      );
    }

    const payload = {
      event: "payment.paid",
      event_id: `sim_evt_${Date.now()}`,
      payment_id: `sim_pay_${orderId}`,
      order_id: orderId,
      status: "paid",
      amount: Number(order.totalPrice || 0),
      currency: "IDR",
      payment_code: "SIMULATED",
      paid_at: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    const rawBody = JSON.stringify(payload);
    const secret = getPaymentWebhookSecret();
    const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const origin = new URL(req.url).origin;
    const webhookUrl = `${origin}/api/webhooks/payment`;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-payment-signature": signature,
      },
      body: rawBody,
    });

    const resJson = await res.json().catch(() => ({}));

    if (!res.ok || !resJson?.success) {
      logger.error("Simulation webhook trigger failed", { orderId, resJson });
      return NextResponse.json(
        {
          success: false,
          message: "Gagal memproses simulasi pembayaran ke webhook.",
          details: resJson,
        },
        { status: 500 },
      );
    }

    logger.info("Simulation payment successfully triggered", { orderId });
    return NextResponse.json({
      success: true,
      message: "Simulasi pembayaran lunas berhasil diproses. Transaksi Digiflazz sedang berjalan.",
    });
  } catch (error: any) {
    logger.error("simulate-pay route failed", { error });
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal.", error: error?.message },
      { status: 500 },
    );
  }
}

export const POST = withRequestLogging(postHandler);
