import { NextResponse } from "next/server";
import { db, promoCodes } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const codeInput = (body.promo_code || body.code || "").trim().toUpperCase();
    const subtotal = Number(body.total_price || body.subtotal || 0);

    if (!codeInput) {
      return NextResponse.json({ success: false, message: "Kode promo harus diisi" }, { status: 400 });
    }

    let promo: any = null;

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbPromos = await db.select().from(promoCodes).where(eq(promoCodes.code, codeInput)).limit(1);
        if (dbPromos && dbPromos[0] && dbPromos[0].isActive) {
          const p = dbPromos[0];
          promo = {
            code: p.code,
            discount_type: p.discountType,
            discount_value: Number(p.discountValue),
            min_order: Number(p.minOrder),
            max_discount: Number(p.maxDiscount),
          };
        }
      } catch (e) {
        console.warn("Fallback promo validate:", e);
      }
    }

    if (!promo) {
      if (codeInput === "TOPUPSON10") {
        promo = { code: "TOPUPSON10", discount_type: "percent", discount_value: 10, min_order: 20000, max_discount: 15000 };
      } else if (codeInput === "HEMAT5RB") {
        promo = { code: "HEMAT5RB", discount_type: "fixed", discount_value: 5000, min_order: 30000, max_discount: 5000 };
      } else if (codeInput === "NEWUSER") {
        promo = { code: "NEWUSER", discount_type: "fixed", discount_value: 10000, min_order: 50000, max_discount: 10000 };
      }
    }

    if (!promo) {
      return NextResponse.json({ success: false, message: "Kode promo tidak valid atau sudah kadaluarsa" }, { status: 404 });
    }

    if (subtotal < promo.min_order) {
      return NextResponse.json({
        success: false,
        message: `Minimal transaksi untuk kode ini adalah Rp ${promo.min_order.toLocaleString("id-ID")}`,
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (promo.discount_type === "percent") {
      discountAmount = Math.floor((subtotal * promo.discount_value) / 100);
      if (promo.max_discount > 0 && discountAmount > promo.max_discount) {
        discountAmount = promo.max_discount;
      }
    } else {
      discountAmount = promo.discount_value;
    }

    const finalPrice = Math.max(0, subtotal - discountAmount);

    return NextResponse.json({
      success: true,
      message: "Kode promo berhasil digunakan!",
      data: {
        promo_code: promo.code,
        discount_amount: discountAmount,
        final_price: finalPrice,
      },
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "Gagal memvalidasi kode promo" }, { status: 500 });
  }
}
