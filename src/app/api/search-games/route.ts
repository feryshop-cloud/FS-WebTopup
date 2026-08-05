import { NextResponse } from "next/server";
import { seedGames } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";
import { logger } from "@/lib/logger";

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
      (game) =>
        game.title.toLowerCase().includes(search) || game.slug.toLowerCase().includes(search),
    );

    if (results.length === 0) {
      results = seedGames
        .filter(
          (g) => g.title.toLowerCase().includes(search) || g.slug.toLowerCase().includes(search),
        )
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
  } catch (err) {
    logger.error("Gagal mencari game", { error: err });
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}
