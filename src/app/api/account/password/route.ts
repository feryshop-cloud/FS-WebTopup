import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasDatabaseConnection, sqlClient } from "@/lib/db";
import { signInSupabaseWithPassword, updateSupabaseAuthPassword } from "@/lib/supabase-auth";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!hasDatabaseConnection) {
      return NextResponse.json({ success: false, message: "Database belum dikonfigurasi" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const currentPassword = String(body.current_password || body.old_password || "");
    const newPassword = String(body.new_password || body.password || "");
    const confirmation = String(body.password_confirmation || body.new_password_confirmation || newPassword);

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, message: "Password lama dan password baru harus diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password baru minimal 6 karakter" }, { status: 400 });
    }

    if (newPassword !== confirmation) {
      return NextResponse.json({ success: false, message: "Konfirmasi password tidak sama" }, { status: 400 });
    }

    const authUser = await signInSupabaseWithPassword(email, currentPassword).catch(() => null);
    if (!authUser) {
      return NextResponse.json({ success: false, message: "Password lama salah" }, { status: 401 });
    }

    const dbUsers = await sqlClient<{ id: string }[]>`
      select id from public.users where id = ${authUser.id} limit 1
    `;
    const user = dbUsers[0];

    if (!user) {
      return NextResponse.json({ success: false, message: "Password lama salah" }, { status: 401 });
    }

    await updateSupabaseAuthPassword(user.id, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah",
    }, { status: 200 });
  } catch (err) {
    console.error("Change password API error:", err);
    return NextResponse.json({ success: false, message: "Gagal mengubah password" }, { status: 500 });
  }
}
