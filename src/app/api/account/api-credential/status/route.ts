import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newStatus = body.status === "active" ? "active" : "inactive";

    return NextResponse.json(
      {
        success: true,
        message: `Status API Credential berhasil diubah menjadi ${newStatus}`,
        data: {
          status: newStatus,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Gagal mengubah status API Credential", { error: err });
    return NextResponse.json({ success: false, message: "Gagal mengubah status" }, { status: 500 });
  }
}
