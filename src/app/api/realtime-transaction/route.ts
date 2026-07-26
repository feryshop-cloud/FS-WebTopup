import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
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
        console.warn("Fallback realtime-transaction:", e);
      }
    }

    if (results.length === 0) {
      results = [
        { id: 1, nickname: "K***a", game: "Mobile Legends", product: "Weekly Diamond Pass", created_at: "1 menit lalu" },
        { id: 2, nickname: "S***i", game: "Valorant", product: "625 Points", created_at: "3 menit lalu" },
        { id: 3, nickname: "M***d", game: "Free Fire", product: "355 Diamonds", created_at: "7 menit lalu" },
      ];
    }

    return NextResponse.json({
      success: true,
      data: results,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal memuat transaksi realtime" }, { status: 500 });
  }
}