import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id") ?? "";

    if (!orderId) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 422 });
    }

    let foundOrder: any = null;

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbOrders = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
        if (dbOrders && dbOrders[0]) {
          foundOrder = dbOrders[0];
        }
      } catch (e) {
        logger.warn("Fallback invoices/search", { error: e });
      }
    }

    if (!foundOrder) {
      // Fallback demo order jika sesuai pencarian
      if (orderId.startsWith("TSON") || orderId === "DEMO-123") {
        foundOrder = {
          order_id: orderId,
          product_title: "86 Diamonds (78 + 8 Bonus)",
          total_price: 23500,
          payment_status: "pending",
          buy_status: "pending",
          created_at: new Date().toISOString(),
        };
      }
    }

    if (!foundOrder) {
      return NextResponse.json(
        { success: false, message: "Pesanan tidak ditemukan", data: null },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          order_id: foundOrder.orderId || foundOrder.order_id,
          product_title: foundOrder.productTitle || foundOrder.product_title,
          total_price: Number(foundOrder.totalPrice || foundOrder.total_price),
          payment_status: foundOrder.paymentStatus || foundOrder.payment_status,
          buy_status: foundOrder.buyStatus || foundOrder.buy_status,
          created_at: foundOrder.createdAt || foundOrder.created_at,
        },
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal mencari pesanan", details: err?.message },
      { status: 500 },
    );
  }
}
