import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getSiteSettings();
    return NextResponse.json(payload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat pengaturan",
    }, { status: 500 });
  }
}