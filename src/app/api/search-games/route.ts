import { NextResponse } from "next/server";
import { db, games } from "@/lib/db";
import { ilike, eq, and } from "drizzle-orm";
import { seedGames } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = (url.searchParams.get("search") ?? "").toLowerCase().trim();

    if (!search) {
      return NextResponse.json({ games: [] }, { status: 200 });
    }

    let results: any[] = [];

    results = (await getLivePublicGames()).filter(
      (game) => game.title.toLowerCase().includes(search) || game.slug.toLowerCase().includes(search),
    );

    if (results.length === 0 && (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL)) {
      try {
        const dbGames = await db.select().from(games).where(
          and(eq(games.isActive, true), ilike(games.title, `%${search}%`))
        );
        if (dbGames && dbGames.length > 0) {
          results = dbGames.map((g) => ({
            id: g.id,
            title: g.title,
            slug: g.slug,
            image: g.image,
            banner: g.banner,
            logo: g.logo,
            developers: g.developers,
            category_id: g.categoryId,
            is_popular: g.isPopular,
          }));
        }
      } catch (e) {
        console.warn("Fallback search ke seed games:", e);
      }
    }

    if (results.length === 0) {
      results = seedGames
        .filter((g) => g.title.toLowerCase().includes(search) || g.slug.toLowerCase().includes(search))
        .map((g) => ({
          id: g.id,
          title: g.title,
          slug: g.slug,
          image: g.image,
          banner: g.banner,
          logo: g.logo,
          developers: g.developers,
          category_id: g.categoryId,
          is_popular: g.isPopular,
        }));
    }

    return NextResponse.json({ games: results }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}
