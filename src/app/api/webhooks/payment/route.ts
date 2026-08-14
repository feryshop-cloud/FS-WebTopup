import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { verifyPaymentWebhookSignature, type PaymentWebhookPayload } from "@/lib/payment-client";

export const dynamic = "force-dynamic";

/**
 * Webhook endpoint yang dipanggil payment-service worker (Cloudflare Worker).
 * Worker menandatangani body dengan HMAC-SHA256 (header x-payment-signature,
 * kompat mundur x-mock-signature). Provider bisa mock / pakasir.
 */
async function postHandler(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-payment-signature") || req.headers.get("x-mock-signature");

  const valid = await verifyPaymentWebhookSignature(rawBody, signature);
  if (!valid) {
    logger.warn("payment webhook invalid signature", {
      signature: signature ? signature.slice(0, 16) + "..." : null,
    });
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
  }

  let payload: PaymentWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as PaymentWebhookPayload;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { event, order_id: orderId, payment_id: paymentId, status } = payload;

  if (!orderId || !event || !paymentId) {
    return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
  }

  try {
    const rows = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
    const order = rows[0];

    if (!order) {
      logger.warn("payment webhook for unknown order", { orderId, paymentId, event });
      return NextResponse.json({ success: true, received: true, message: "Order unknown" });
    }

    // Idempotent: jangan menimpa status final.
    const finalStatuses = new Set(["success", "failed", "expired"]);
    if (order.paymentStatus && finalStatuses.has(order.paymentStatus)) {
      return NextResponse.json({ success: true, received: true, deduplicated: true });
    }

    const provider = (order.gatewayResponse as { provider?: string } | null)?.provider ?? "mock";

    if (event === "payment.paid") {
      await db
        .update(orders)
        .set({
          paymentStatus: "success",
          buyStatus: "success",
          serialNumber: `${provider.toUpperCase()}-${orderId}`,
          gatewayResponse: {
            ...(order.gatewayResponse as object | null),
            [provider]: {
              status,
              paymentId,
              paidAt: payload.paid_at,
              eventId: payload.event_id,
            },
          },
        })
        .where(eq(orders.orderId, orderId));
    } else if (event === "payment.failed") {
      await db
        .update(orders)
        .set({
          paymentStatus: "failed",
          gatewayResponse: {
            ...(order.gatewayResponse as object | null),
            [provider]: {
              status,
              paymentId,
              failureReason: payload.failure_reason,
              eventId: payload.event_id,
            },
          },
        })
        .where(eq(orders.orderId, orderId));
    } else if (event === "payment.expired") {
      await db
        .update(orders)
        .set({
          paymentStatus: "expired",
          gatewayResponse: {
            ...(order.gatewayResponse as object | null),
            [provider]: {
              status,
              paymentId,
              failureReason: payload.failure_reason,
              eventId: payload.event_id,
            },
          },
        })
        .where(eq(orders.orderId, orderId));
    }

    logger.info("payment webhook processed", { orderId, paymentId, event, status, provider });
    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    logger.error("payment webhook failed", { orderId, paymentId, event, error });
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export const POST = withRequestLogging(postHandler);
