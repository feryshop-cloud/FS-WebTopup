import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim();

    if (!email) {
      return NextResponse.json({ success: false, message: "Email wajib diisi" }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Link reset password telah dikirim ke email Anda",
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Gagal mengirim link reset password", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal mengirim link reset password" },
      { status: 500 },
    );
  }
}
