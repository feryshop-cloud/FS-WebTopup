import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil diperbarui",
        data: {
          name: body.name || "Member Feryshop",
          phone: body.phone || "081234567890",
          email: body.email || "user@feryshop.id",
        },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Gagal memperbarui profil", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui profil" },
      { status: 500 },
    );
  }
}
