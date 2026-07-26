import { NextResponse } from "next/server";
import { db, categories } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { seedCategories } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allCategories: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbCategories = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
        if (dbCategories && dbCategories.length > 0) {
          allCategories = dbCategories.map((c) => ({
            id: c.id,
            title: c.title,
            logo: c.logo,
            game: c.gameSlug || c.title,
          }));
        }
      } catch (e) {
        console.warn("Fallback ke seed categories:", e);
      }
    }

    if (allCategories.length === 0) {
      allCategories = seedCategories.map((c) => ({
        id: c.id,
        title: c.title,
        logo: c.logo,
        game: c.game,
      }));
    }

    return NextResponse.json({
      success: true,
      data: allCategories,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat kategori",
      error: err?.message,
    }, { status: 500 });
  }
}
