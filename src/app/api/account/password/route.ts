import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body.current_password || !body.new_password) {
      return NextResponse.json({ success: false, message: "Password lama dan password baru harus diisi" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal mengubah password" }, { status: 500 });
  }
}
