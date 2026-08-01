import { NextResponse } from "next/server";
import { hasDatabaseConnection, sqlClient } from "@/lib/db";
import { signInSupabaseWithPassword } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email dan password wajib diisi" }, { status: 400 });
    }

    if (!hasDatabaseConnection) {
      return NextResponse.json({ success: false, message: "Database belum dikonfigurasi" }, { status: 503 });
    }

    const authUser = await signInSupabaseWithPassword(email, password).catch(() => null);
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Email atau password salah" }, { status: 401 });
    }

    const profiles = await sqlClient<{ id: string; full_name: string; email: string; status: string }[]>`
      select id, full_name, email, status
      from public.users
      where id = ${authUser.id}
      limit 1
    `;
    const user = profiles[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "Profil akun tidak ditemukan" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      token: `TSON-JWT-${Date.now()}`,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: "member",
        saldo: 0,
        whatsapp: null,
      },
    }, { status: 200 });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan sistem saat login" }, { status: 500 });
  }
}
