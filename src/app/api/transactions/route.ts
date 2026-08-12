import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db, orders } from "@/lib/db";
import { desc, eq, or } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { authOptions } from "@/lib/auth";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

export const dynamic = "force-dynamic";

async function getHandler() {
  try {
    const session = await getServerSession(authOptions);
    const rawUserId =
      typeof (session?.user as any)?.id === "string" ? (session?.user as any).id : null;
    const userId =
      rawUserId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawUserId)
        ? rawUserId
        : null;
    const sessionEmail =
      typeof session?.user?.email === "string" ? session.user.email.toLowerCase() : null;

    let results: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const q = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20);
        let dbOrders;
        if (userId) {
          // UUID user: order milik user_id + fallback email (utk order lama user Google).
          dbOrders = await q.where(
            or(eq(orders.userId, userId), eq(orders.email, sessionEmail ?? "")),
          );
        } else if (sessionEmail) {
          // Login Google (id non-UUID): cocokkan via email order.
          dbOrders = await q.where(eq(orders.email, sessionEmail));
        } else {
          dbOrders = await q;
        }
        if (dbOrders && dbOrders.length > 0) {
          results = dbOrders.map((o) => ({
            id: o.id,
            order_id: o.orderId,
            game: o.gameSlug,
            product_title: o.productTitle,
            total_price: Number(o.totalPrice),
            payment_status: o.paymentStatus,
            buy_status: o.buyStatus,
            created_at: o.createdAt,
          }));
        }
      } catch (e) {
        logger.warn("transactions fell back to demo data", { error: e });
      }
    }

    if (results.length === 0 && !rawUserId) {
      results = [
        {
          id: 1,
          order_id: "TSON-100234",
          game: "Mobile Legends",
          product_title: "86 Diamonds (78 + 8 Bonus)",
          total_price: 23500,
          payment_status: "success",
          buy_status: "success",
          created_at: "2026-07-25T10:30:00Z",
        },
        {
          id: 2,
          order_id: "TSON-100198",
          game: "Valorant",
          product_title: "300 Points",
          total_price: 40000,
          payment_status: "success",
          buy_status: "success",
          created_at: "2026-07-24T15:12:00Z",
        },
      ];
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          data: results,
          total: results.length,
          current_page: 1,
          last_page: 1,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    logger.error("transactions failed", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal memuat histori transaksi" },
      { status: 500 },
    );
  }
}

export const GET = withRequestLogging(getHandler);
