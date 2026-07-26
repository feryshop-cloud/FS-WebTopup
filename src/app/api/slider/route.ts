import { NextResponse } from "next/server";
import { seedSliders } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Return slider banners (dari Supabase / Seed Data)
    return NextResponse.json({
      success: true,
      data: seedSliders,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat slider",
      error: err?.message,
    }, { status: 500 });
  }
}
