import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const whatsapp = (body.whatsapp || "").trim();

    if (!whatsapp) {
      return NextResponse.json({ success: false, message: "Nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Kode OTP berhasil dikirim ke WhatsApp Anda",
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal mengirim OTP" }, { status: 500 });
  }
}
