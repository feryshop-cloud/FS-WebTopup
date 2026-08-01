import { NextResponse } from "next/server";
import { getCategoriesPayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getCategoriesPayload(), { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat kategori",
      error: err?.message,
    }, { status: 500 });
  }
}
