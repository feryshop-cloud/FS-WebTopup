import { NextResponse } from "next/server";
import { db, categories } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { seedCategories } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allCategories: any[] = [];
    const liveGames = await getLivePublicGames();

    if (liveGames.length > 0) {
      allCategories = liveGames.map((game) => ({
        id: game.id,
        title: game.title,
        logo: game.logo || game.image,
        game: game.slug,
      }));
    }

    if (allCategories.length === 0 && (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL)) {
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
