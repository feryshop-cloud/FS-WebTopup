import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, orders } from "@/lib/db";
import { and, eq, notInArray } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { verifyPaymentWebhookSignature } from "@/lib/payment-client";
import { OrderBuyStatus, OrderPaymentStatus } from "@/types/status";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders/expire
 *
 * Server-to-server endpoint invoked by the external payment-service Worker
 * (Cloudflare Worker) when a payment intent reaches its expiration window and
 * has not been settled.
 *
 * The Worker owns expiry as the source of truth; this endpoint applies the
 * terminal `expired` state to the storefront's `orders` table.
 *
 * Key Steps:
 * 1. Verifies HMAC-SHA256 signature from `x-payment-signature` or `x-mock-signature` header.
 * 2. Parses payload (`order_id`, `payment_id`, `event_id`).
 * 3. Updates order status to `expired` in PostgreSQL DB (`orders` table).
 * 4. Logs `order expired by payment-service` for traceability.
 */
interface ExpirePayload {
  order_id: string;
  payment_id: string;
  event_id?: string;
}

async function postHandler(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-payment-signature") || req.headers.get("x-mock-signature");

  const valid = await verifyPaymentWebhookSignature(rawBody, signature);
  if (!valid) {
    logger.warn("order expire invalid signature", {
      signature: signature ? signature.slice(0, 16) + "..." : null,
    });
    return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
  }

  let payload: ExpirePayload;
  try {
    payload = JSON.parse(rawBody) as ExpirePayload;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { order_id: orderId, payment_id: paymentId, event_id: eventId } = payload;

  if (!orderId || !paymentId) {
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
      logger.warn("order expire target not found", { orderId, paymentId });
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

    const updated = await db
      .update(orders)
      .set({
        paymentStatus: OrderPaymentStatus.EXPIRED,
        buyStatus: OrderBuyStatus.FAILED,
        gatewayResponse: {
          ...existingGateway,
          [provider]: {
            status: "expired",
            paymentId,
            eventId,
          },
        },
      })
      .where(and(eq(orders.orderId, orderId), notInArray(orders.paymentStatus, finalStatuses)))
      .returning({ id: orders.id });

    if (updated.length === 0) {
      logger.info("order expire deduplicated", { orderId, paymentId, eventId, provider });
      return NextResponse.json({ success: true, received: true, deduplicated: true });
    }

    // Mirror the invoice status view so the customer sees "expired" in real time.
    revalidatePath(`/invoices/${orderId}`);

    logger.info("order expired by payment-service", { orderId, paymentId, eventId, provider });
    return NextResponse.json({ success: true, received: true });
  } catch (error: any) {
    logger.error("order expire failed", { orderId, paymentId, event_id: eventId, error });
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export const POST = withRequestLogging(postHandler);
