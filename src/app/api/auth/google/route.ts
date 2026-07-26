import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({
      success: true,
      message: "Google login berhasil",
      token: `TSON-GOOGLE-${Date.now()}`,
      user: {
        id: "USR-GOOGLE-001",
        name: body.name || "Google User",
        email: body.email || "google@feryshop.id",
        role: "member",
        saldo: 50000,
        whatsapp: "081234567890",
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Google login gagal" }, { status: 500 });
  }
}
