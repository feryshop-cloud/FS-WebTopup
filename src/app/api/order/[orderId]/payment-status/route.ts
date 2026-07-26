import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { eq } from "drizzle-orm";

type Params = { orderId: string };

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params: Promise<Params> }) {
  try {
    const { orderId } = await context.params;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID tidak ditemukan" }, { status: 400 });
    }

    let paymentStatus = "success";
    let buyStatus = "success";

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbOrders = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
        if (dbOrders && dbOrders[0]) {
          paymentStatus = dbOrders[0].paymentStatus;
          buyStatus = dbOrders[0].buyStatus;
        }
      } catch (e) {
        console.warn("Fallback payment-status:", e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        payment_status: paymentStatus,
        buy_status: buyStatus,
        paid_at: new Date().toISOString(),
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal memuat status pembayaran" }, { status: 500 });
  }
}
