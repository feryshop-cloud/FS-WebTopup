import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db, orders } from "@/lib/db";
import { eq, or } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const rawUserId =
      typeof (session?.user as any)?.id === "string" ? (session?.user as any).id : null;
    const userId =
      rawUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId)
        ? rawUserId
        : null;
    const sessionEmail =
      typeof session?.user?.email === "string" ? session.user.email.toLowerCase() : null;

    let summary = {
      total_transaction: 0,
      total_spent: 0,
      pending: 0,
      success: 0,
      failed: 0,
    };

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const q = db.select().from(orders).limit(100);
        let dbOrders;
        if (userId) {
          dbOrders = await q.where(
            or(eq(orders.userId, userId), eq(orders.email, sessionEmail ?? "")),
          );
        } else if (sessionEmail) {
          dbOrders = await q.where(eq(orders.email, sessionEmail));
        } else {
          dbOrders = await q;
        }
        if (dbOrders && dbOrders.length > 0) {
          summary.total_transaction = dbOrders.length;
          dbOrders.forEach((o) => {
            if (o.paymentStatus === "success" || o.buyStatus === "success") {
              summary.success += 1;
              summary.total_spent += Number(o.totalPrice || 0);
            } else if (o.paymentStatus === "pending") {
              summary.pending += 1;
            } else {
              summary.failed += 1;
            }
          });
        }
      } catch (e) {
        logger.warn("Fallback transaction-summary", { error: e });
      }
    }

    if (summary.total_transaction === 0 && !rawUserId) {
      summary = {
        total_transaction: 2,
        total_spent: 63500,
        pending: 0,
        success: 2,
        failed: 0,
      };
    }

    const data = {
      total: summary.total_transaction,
      paid: summary.success,
      unpaid: summary.pending,
      failed: summary.failed,
      expired: 0,
      failed_expired: summary.failed,
      total_spent: summary.total_spent,
      total_transaction: summary.total_transaction,
    };

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  } catch (_err: any) {
    return NextResponse.json(
      { success: false, message: "Gagal memuat ringkasan transaksi" },
      { status: 500 },
    );
  }
}
