import { NextResponse } from "next/server";
import { sqlClient } from "@/lib/db";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sqlClient<
      {
        id: number;
        code: string;
        discount_type: string;
        discount_value: string | number;
        min_order: string | number;
        max_discount: string | number;
        is_active: boolean | null;
      }[]
    >`
      select id, code, discount_type, discount_value, min_order, max_discount, is_active
      from public.promo_codes
      where is_active = true
        and (start_date is null or start_date <= now())
        and (end_date is null or end_date >= now())
      order by code asc
    `;

    const data = rows.map((p) => ({
      id: p.id,
      name: `Diskon ${p.discount_type === "percent" ? `${Number(p.discount_value)}%` : "Rp " + Math.floor(Number(p.discount_value)).toLocaleString("id-ID")}`,
      code: p.code,
      status: p.is_active ? "ACTIVE" : "INACTIVE",
      is_eligible: true,
      discount_type: p.discount_type,
      discount_value: Number(p.discount_value),
      min_product_price: Number(p.min_order) || null,
    }));

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    logger.error("promo list failed", { error });
    return NextResponse.json(
      { success: false, message: "Gagal memuat kode promo", error: error?.message },
      { status: 500 },
    );
  }
}
