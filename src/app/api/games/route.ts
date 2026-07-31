import { NextResponse } from "next/server";
import { db, games } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { seedGames } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allGames: any[] = [];

    allGames = await getLivePublicGames();

    // Coba ambil dari database Supabase / Drizzle
    if (allGames.length === 0 && (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL)) {
      try {
        const dbGames = await db.select().from(games).where(eq(games.isActive, true)).orderBy(asc(games.sortOrder));
        if (dbGames && dbGames.length > 0) {
          allGames = dbGames.map((g) => ({
            id: g.id,
            title: g.title,
            slug: g.slug,
            image: g.image,
            banner: g.banner,
            logo: g.logo,
            developers: g.developers || "Game Developer",
            category_id: g.categoryId || 1,
            description: g.description,
            instructions: g.instructions,
            is_popular: g.isPopular,
          }));
        }
      } catch (e) {
        console.warn("Fallback ke seed games karena kueri Supabase gagal/belum disetup:", e);
      }
    }

    // Jika database kosong atau gagal terhubung, gunakan seed data
    if (allGames.length === 0) {
      allGames = seedGames.map((g) => ({
        id: g.id,
        title: g.title,
        slug: g.slug,
        image: g.image,
        banner: g.banner,
        logo: g.logo,
        developers: g.developers,
        category_id: g.categoryId,
        description: g.description,
        instructions: g.instructions,
        is_popular: g.isPopular,
      }));
    }

    const populerGames = allGames.filter((g) => g.is_popular);

    return NextResponse.json({
      success: true,
      games: allGames,
      populerGames: populerGames.length > 0 ? populerGames : allGames.slice(0, 4),
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat katalog game",
      error: err?.message,
    }, { status: 500 });
  }
}
