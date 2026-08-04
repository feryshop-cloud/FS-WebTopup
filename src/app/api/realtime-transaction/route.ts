import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { desc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

export const dynamic = "force-dynamic";

async function getHandler() {
  try {
    let results: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(15);
        if (dbOrders && dbOrders.length > 0) {
          results = dbOrders.map((o) => {
            const nick = o.nickname || "Player";
            const maskedNick = nick.length > 2 ? `${nick[0]}***${nick[nick.length - 1]}` : "P***r";
            return {
              id: o.id,
              nickname: maskedNick,
              game: o.gameSlug,
              product: o.productTitle,
              created_at: o.createdAt,
            };
          });
        }
      } catch (e) {
        logger.warn("realtime-transaction fell back to demo data", { error: e });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    }, { status: 200 });
  } catch (err: any) {
    logger.error("realtime-transaction failed", { error: err });
    return NextResponse.json({ success: false, message: "Gagal memuat transaksi realtime" }, { status: 500 });
  }
}

export const GET = withRequestLogging(getHandler);