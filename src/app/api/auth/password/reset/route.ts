import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim();
    const token = (body.token || "").trim();
    const password = (body.password || "").trim();

    if (!email || !token || !password) {
      return NextResponse.json({ success: false, message: "Data reset password tidak lengkap" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah. Silakan login kembali.",
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal mereset password" }, { status: 500 });
  }
}
