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
        const dbOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);
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
        logger.warn("latest-orders fell back to demo data", { error: e });
      }
    }

    if (results.length === 0) {
      results = [
        {
          id: 1,
          nickname: "B***i",
          game: "Mobile Legends",
          product: "86 Diamonds",
          created_at: "Baru saja",
        },
        {
          id: 2,
          nickname: "R***y",
          game: "Valorant",
          product: "300 Points",
          created_at: "2 menit lalu",
        },
        {
          id: 3,
          nickname: "D***a",
          game: "Free Fire",
          product: "140 Diamonds",
          created_at: "5 menit lalu",
        },
        {
          id: 4,
          nickname: "A***n",
          game: "PUBG Mobile",
          product: "325 UC",
          created_at: "8 menit lalu",
        },
      ];
    }

    return NextResponse.json(
      {
        success: true,
        data: results,
      },
      { status: 200 },
    );
  } catch (err: any) {
    logger.error("latest-orders failed", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal memuat pesanan terbaru" },
      { status: 500 },
    );
  }
}

export const GET = withRequestLogging(getHandler);
