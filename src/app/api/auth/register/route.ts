import { NextResponse } from "next/server";
import { hasDatabaseConnection, sqlClient } from "@/lib/db";
import { createSupabaseAuthUser, deleteSupabaseAuthUser } from "@/lib/supabase-auth";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

export const dynamic = "force-dynamic";

const DEFAULT_MEMBER_ROLE_ID = "5acc7db0-2460-40bc-8f12-9420e6543252";

async function postHandler(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const password = typeof body.password === "string" ? body.password : "";
    const phone = (body.whatsapp || body.phone || "").trim();

    if (!email || !name || !password) {
      return NextResponse.json({ success: false, message: "Nama, email, dan password wajib diisi" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
    }

    if (!hasDatabaseConnection) {
      return NextResponse.json({ success: false, message: "Database belum dikonfigurasi" }, { status: 503 });
    }

    const existingUsers = await sqlClient<{ id: string }[]>`
      select id from public.users where email = ${email} limit 1
    `;
    if (existingUsers[0]) {
      return NextResponse.json({ success: false, message: "Akun dengan email tersebut sudah terdaftar" }, { status: 409 });
    }

    const authUser = await createSupabaseAuthUser({ email, password, name });

    try {
      await sqlClient`
        insert into public.users (id, role_id, full_name, email, status)
        values (${authUser.id}, ${DEFAULT_MEMBER_ROLE_ID}, ${name}, ${email}, 'Aktif')
      `;
    } catch (profileError) {
      await deleteSupabaseAuthUser(authUser.id);
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      token: `TSON-JWT-${Date.now()}`,
      user: {
        id: authUser.id,
        name,
        email,
        role: "member",
        saldo: 0,
        whatsapp: phone || null,
      },
    }, { status: 200 });
  } catch (err) {
    logger.error("register failed", { error: err });
    const message = err instanceof Error ? err.message : "";
    if (message.includes("SUPABASE_URL") || message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json({ success: false, message }, { status: 503 });
    }
    if (message.toLowerCase().includes("already") || message.toLowerCase().includes("registered")) {
      return NextResponse.json({ success: false, message: "Akun dengan email tersebut sudah terdaftar" }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Gagal melakukan registrasi" }, { status: 500 });
  }
}

export const POST = withRequestLogging(postHandler);
