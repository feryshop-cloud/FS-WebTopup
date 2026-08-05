import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: {
        api_key: "TSON-KEY-88291047192",
        secret_key: "TSON-SEC-9918273645",
        status: "active",
        whitelist_ip: "0.0.0.0/0",
        webhook_url: "https://example.com/webhook",
      },
    },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(
      {
        success: true,
        message: "API Credential berhasil diperbarui",
        data: {
          api_key: "TSON-KEY-88291047192",
          secret_key: "TSON-SEC-9918273645",
          status: body.status || "active",
          whitelist_ip: body.whitelist_ip || "0.0.0.0/0",
          webhook_url: body.webhook_url || "",
        },
      },
      { status: 200 },
    );
  } catch (err) {
    logger.error("Gagal memperbarui API Credential", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui API Credential" },
      { status: 500 },
    );
  }
}
