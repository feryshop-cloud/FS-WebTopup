import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.whatsapp || body.phone || "").trim();

    if (!email || !name) {
      return NextResponse.json({ success: false, message: "Nama dan email wajib diisi" }, { status: 400 });
    }

    const newId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        await db.insert(users).values({
          name: name,
          email: email,
          whatsapp: phone || "081234567890",
          role: "member",
          balance: "0",
        });
      } catch (e) {
        console.warn("Register API DB insert fallback:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil",
      token: `TSON-JWT-${Date.now()}`,
      user: {
        id: newId,
        name: name,
        email: email,
        role: "member",
        saldo: 0,
        whatsapp: phone || "081234567890",
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Gagal melakukan registrasi" }, { status: 500 });
  }
}
