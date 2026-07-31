import { NextResponse } from "next/server";
import { db, games, products } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import { getLivePublicGames } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: any) {
  try {
    const slug = context?.params?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, message: "Slug tidak ditemukan" }, { status: 400 });
    }

    let gameData: any = null;
    let productsData: any[] = [];

    const liveGame = (await getLivePublicGames()).find((game) => game.slug === slug);
    if (liveGame) {
      gameData = liveGame;
    }

    // 1. Coba ambil dari Supabase / Drizzle
    if (!gameData && (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL)) {
      try {
        const dbGame = await db.select().from(games).where(eq(games.slug, slug)).limit(1);
        if (dbGame && dbGame[0]) {
          const g = dbGame[0];
          gameData = {
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
          };

          const dbProducts = await db.select().from(products).where(eq(products.gameSlug, slug)).orderBy(asc(products.sortOrder));
          productsData = dbProducts.map((p) => ({
            id: p.id,
            title: p.title,
            brand: g.title,
            selling_price: Number(p.sellingPrice),
            selling_price_gold: Number(p.sellingPriceGold),
            selling_price_platinum: Number(p.sellingPricePlatinum),
            promo_price: p.promoPrice ? Number(p.promoPrice) : null,
            status: p.isActive ? 1 : 0,
            is_active: p.isActive,
            logo: p.logo || p.images || null,
          }));
        }
      } catch (e) {
        console.warn(`Fallback game [${slug}] ke seed data:`, e);
      }
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
      return NextResponse.json({ success: false, message: "Game tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      game: {
        ...gameData,
        products: productsData,
      },
      products: productsData,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan sistem",
      error: err?.message,
    }, { status: 500 });
  }
}
