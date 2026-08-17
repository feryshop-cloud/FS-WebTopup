import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { db, orders } from "@/lib/db";
import { and, eq, notInArray } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { verifyPaymentWebhookSignature, type PaymentWebhookPayload } from "@/lib/payment-client";
import { OrderPaymentStatus, OrderBuyStatus } from "@/types/status";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/payment
 *
 * Webhook handler invoked by the external payment-service worker (Cloudflare Worker).
 * The worker signs request bodies with an HMAC-SHA256 signature using the shared secret.
 *
 * Key Steps:
 * 1. Verifies HMAC-SHA256 signature from `x-payment-signature` or `x-mock-signature` header.
 * 2. Parses event payload (`payment.paid`, `payment.failed`).
 *    Order expiry is handled separately by `POST /api/orders/expire`, owned by payment-service.
 * 3. Updates order status in PostgreSQL DB (`orders` table).
 * 4. Triggers item fulfillment / provisioning workflow on successful payment.
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
    const [order] = await db
      .select({
        id: orders.id,
        orderId: orders.orderId,
        paymentStatus: orders.paymentStatus,
        gatewayResponse: orders.gatewayResponse,
      })
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (!order) {
      logger.warn("payment webhook order not found", { orderId, paymentId });
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    type GatewayData = { provider?: string; [key: string]: unknown };
    const existingGateway = (order.gatewayResponse as GatewayData | null) ?? {};
    const provider = existingGateway.provider ?? "mock";
    const finalStatuses: OrderPaymentStatus[] = [
      OrderPaymentStatus.SUCCESS,
      OrderPaymentStatus.FAILED,
      OrderPaymentStatus.EXPIRED,
    ];

    let applied = false;

    if (event === "payment.paid") {
      const updated = await db
        .update(orders)
        .set({
          paymentStatus: OrderPaymentStatus.SUCCESS,
          buyStatus: OrderBuyStatus.SUCCESS,
          serialNumber: `${provider.toUpperCase()}-${orderId}`,
          gatewayResponse: {
            ...existingGateway,
            [provider]: {
              status,
              paymentId,
              paidAt: payload.paid_at,
              eventId: payload.event_id,
            },
          },
        })
        .where(and(eq(orders.orderId, orderId), notInArray(orders.paymentStatus, finalStatuses)))
        .returning({ id: orders.id });
      applied = updated.length > 0;

      if (applied) {
        // Invalidate cache seketika: akun (jika akun marketplace) langsung hilang dari katalog,
        // dan halaman invoice status user langsung ter-update lunas secara real-time.
        revalidateTag("marketplace-accounts", { expire: 0 });
        revalidatePath(`/invoices/${orderId}`);
      }
    } else if (event === "payment.failed") {
      const updated = await db
        .update(orders)
        .set({
          paymentStatus: OrderPaymentStatus.FAILED,
          gatewayResponse: {
            ...existingGateway,
            [provider]: {
              status,
              paymentId,
              failureReason: payload.failure_reason,
              eventId: payload.event_id,
            },
          },
        })
        .where(and(eq(orders.orderId, orderId), notInArray(orders.paymentStatus, finalStatuses)))
        .returning({ id: orders.id });
      applied = updated.length > 0;
    }

    if (!applied) {
      return NextResponse.json({ success: true, received: true, deduplicated: true });
    }

    logger.info("payment webhook processed", { orderId, paymentId, event, status, provider });
    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    logger.error("payment webhook failed", { orderId, paymentId, event, error });
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export const POST = withRequestLogging(postHandler);
