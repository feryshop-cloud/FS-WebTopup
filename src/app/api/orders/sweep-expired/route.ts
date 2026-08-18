import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { and, eq, lte } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { OrderPaymentStatus } from "@/types/status";

export const dynamic = "force-dynamic";

/**
 * Validates request authorization using shared CRON_SECRET token.
 * Checks header `Authorization: Bearer <secret>`, `x-cron-secret`, or `?token=<secret>`.
 */
function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Di dev mode tanpa CRON_SECRET,izinkan eksekusi demi kemudahan testing.
    return process.env.NODE_ENV !== "production";
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token === cronSecret) return true;
  }

  const customHeader = req.headers.get("x-cron-secret");
  if (customHeader === cronSecret) return true;

  try {
    const url = new URL(req.url);
    const queryToken = url.searchParams.get("token");
    if (queryToken === cronSecret) return true;
  } catch {
    // Ignore URL parse error
  }

  return false;
}

/**
 * Sweeps all pending orders in PostgreSQL DB (`orders` table) where `expiredTime`
 * is less than or equal to current epoch timestamp (seconds), updating them to `EXPIRED`.
 */
async function sweepHandler(req: Request) {
  if (!isAuthorized(req)) {
    logger.warn("sweep-expired unauthorized attempt", {
      ip: req.headers.get("x-forwarded-for") || null,
    });
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const nowSec = Math.floor(Date.now() / 1000);

    const updated = await db
      .update(orders)
      .set({
        paymentStatus: OrderPaymentStatus.EXPIRED,
      })
      .where(
        and(eq(orders.paymentStatus, OrderPaymentStatus.PENDING), lte(orders.expiredTime, nowSec)),
      )
      .returning({ id: orders.id, orderId: orders.orderId });

    const sweptCount = updated.length;
    const sweptOrderIds = updated.map((item) => item.orderId);

    logger.info("sweep-expired executed", {
      nowSec,
      sweptCount,
      sweptOrderIds,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menyapu ${sweptCount} order kadaluarsa`,
      sweptCount,
      sweptOrderIds,
    });
  } catch (error: any) {
    logger.error("sweep-expired failed", { error: error?.message });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export const POST = withRequestLogging(sweepHandler);
export const GET = withRequestLogging(sweepHandler);
