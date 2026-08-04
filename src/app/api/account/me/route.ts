import { NextResponse } from "next/server";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    let userData: any = null;

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbUsers = await db.select().from(users).limit(1);
        if (dbUsers && dbUsers[0]) {
          const u = dbUsers[0];
          userData = {
            id: u.id,
            name: u.fullName,
            email: u.email,
            phone: "081234567890",
            whatsapp: "081234567890",
            role: "member",
            balance: 0,
            created_at: u.createdAt,
          };
        }
      } catch (e) {
        logger.warn("Fallback account/me", { error: e });
      }
    }

    if (!userData) {
      userData = {
        id: "USR-001",
        name: "Member Feryshop",
        email: "user@feryshop.id",
        phone: "081234567890",
        whatsapp: "081234567890",
        role: "member",
        balance: 50000,
        created_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({
      success: true,
      data: userData,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "Gagal memuat data profil" }, { status: 500 });
  }
}
