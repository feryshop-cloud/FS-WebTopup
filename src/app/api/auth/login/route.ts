import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email dan password wajib diisi" }, { status: 400 });
    }

    let foundUser: any = null;

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (dbUsers && dbUsers[0]) {
          const u = dbUsers[0];
          foundUser = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role || "member",
            saldo: Number(u.balance || 0),
            whatsapp: u.whatsapp || "081234567890",
          };
        }
      } catch (e) {
        console.warn("Login API DB lookup fallback:", e);
      }
    }

    if (!foundUser) {
      foundUser = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: email.split("@")[0].replace(/\b\w/g, (l: string) => l.toUpperCase()),
        email: email,
        role: "member",
        saldo: 50000,
        whatsapp: "081234567890",
      };
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      token: `TSON-JWT-${Date.now()}`,
      user: foundUser,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Terjadi kesalahan sistem saat login" }, { status: 500 });
  }
}
