import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data/settings";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payload = await getSiteSettings();
    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    logger.error("Gagal memuat pengaturan", { error: err });
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat pengaturan",
      },
      { status: 500 },
    );
  }
}
