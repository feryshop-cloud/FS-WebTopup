import { NextResponse } from "next/server";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: any) {
  try {
    const params = await context?.params;
    const slug = params?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { success: false, message: "Slug tidak ditemukan" },
        { status: 400 },
      );
    }

    let gameData: any = null;
    let productsData: any[] = [];

    const liveGame = (await getLivePublicGames()).find((game) => game.slug === slug);
    if (liveGame) {
      gameData = liveGame;
    }

    // 2. Fallback ke seed data jika tidak ada di database
    if (!gameData) {
      const foundSeed = seedGames.find((g) => g.slug === slug);
      if (foundSeed) {
        gameData = {
          id: foundSeed.id,
          title: foundSeed.title,
          slug: foundSeed.slug,
          image: foundSeed.image,
          banner: foundSeed.banner,
          logo: foundSeed.logo,
          developers: foundSeed.developers,
          category_id: foundSeed.categoryId,
          description: foundSeed.description,
          instructions: foundSeed.instructions,
          is_popular: foundSeed.isPopular,
        };

        const foundProducts = seedProducts[slug] || [];
        productsData = foundProducts.map((p) => ({
          ...p,
          brand: foundSeed.title,
          status: p.is_active ? 1 : 0,
        }));
      }
    }

    if (!gameData) {
      return NextResponse.json(
        { success: false, message: "Game tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        game: {
          ...gameData,
          products: productsData,
        },
        products: productsData,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan sistem",
        error: err?.message,
      },
      { status: 500 },
    );
  }
}
