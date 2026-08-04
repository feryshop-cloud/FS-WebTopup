import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const whatsapp = url.searchParams.get("whatsapp") ?? "";

    if (!whatsapp) {
      return NextResponse.json({ error: "Missing whatsapp" }, { status: 422 });
    }

    let results: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbOrders = await db.select().from(orders).where(eq(orders.whatsapp, whatsapp)).orderBy(desc(orders.createdAt)).limit(20);
        if (dbOrders && dbOrders.length > 0) {
          results = dbOrders.map((o) => ({
            order_id: o.orderId,
            product_title: o.productTitle,
            total_price: Number(o.totalPrice),
            payment_status: o.paymentStatus,
            buy_status: o.buyStatus,
            created_at: o.createdAt,
          }));
        }
      } catch (e) {
        logger.warn("Fallback search-by-whatsapp", { error: e });
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memuat histori pesanan", details: err?.message }, { status: 500 });
  }
}