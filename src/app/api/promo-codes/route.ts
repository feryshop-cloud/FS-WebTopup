import { NextResponse } from "next/server";
import { db, promoCodes } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allPromos: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbPromos = await db.select().from(promoCodes).where(eq(promoCodes.isActive, true));
        if (dbPromos && dbPromos.length > 0) {
          allPromos = dbPromos.map((p) => ({
            id: p.id,
            code: p.code,
            discount_type: p.discountType,
            discount_value: Number(p.discountValue),
            min_order: Number(p.minOrder),
          }));
        }
      } catch (e) {
        console.warn("Fallback promo-codes:", e);
      }
    }

    if (allPromos.length === 0) {
      allPromos = [
        { id: 1, code: "FERYSHOP10", discount_type: "percent", discount_value: 10, min_order: 20000, max_discount: 15000 },
        { id: 2, code: "HEMAT5RB", discount_type: "fixed", discount_value: 5000, min_order: 30000, max_discount: 5000 },
      ];
    }

    return NextResponse.json({
      success: true,
      data: allPromos,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat kode promo",
      error: err?.message,
    }, { status: 500 });
  }
}
