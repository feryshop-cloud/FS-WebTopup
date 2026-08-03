import { NextResponse } from "next/server";
import { db, games, products } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import { getLivePublicGames, getLivePublicProducts, shouldQueryLegacyStorefrontSchema } from "@/lib/db/live-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let resultGames: any[] = [];
    const [liveGames, liveProducts] = await Promise.all([
      getLivePublicGames(),
      getLivePublicProducts(),
    ]);

    if (liveGames.length > 0) {
      resultGames = liveGames.map((game) => {
        const gameProductsFromDb = liveProducts
          .filter((product) => product.game_slug === game.slug)
          .map((product) => ({
            id: product.id,
            title: product.title,
            brand: product.brand || game.title,
            selling_price: Number(product.selling_price),
            selling_price_gold: product.selling_price_gold ? Number(product.selling_price_gold) : Number(product.selling_price),
            selling_price_platinum: product.selling_price_platinum ? Number(product.selling_price_platinum) : Number(product.selling_price),
            status: product.is_gangguan ? 0 : (product.is_active ? 1 : 0),
            is_active: product.is_active,
            logo: product.logo || product.images || null,
          }));

        const finalProducts = gameProductsFromDb.length > 0
          ? gameProductsFromDb
          : (seedProducts[game.slug] || []).map((product) => ({
              ...product,
              brand: game.title,
              status: product.is_active ? 1 : 0,
            }));

        return {
          id: game.id,
          title: game.title,
          game_name: game.title,
          name: game.title,
          slug: game.slug,
          logo: game.logo || game.image,
          products: finalProducts,
        };
      });
    }

    if (resultGames.length === 0 && shouldQueryLegacyStorefrontSchema()) {
      try {
        const dbGames = await db.select().from(games).where(eq(games.isActive, true)).orderBy(asc(games.sortOrder));
        if (dbGames && dbGames.length > 0) {
          const dbProducts = await db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.sortOrder));
          
          resultGames = dbGames.map((g) => {
            const gameProducts = dbProducts
              .filter((p) => p.gameSlug === g.slug)
              .map((p) => ({
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

            return {
              id: g.id,
              title: g.title,
              slug: g.slug,
              logo: g.logo || g.image,
              products: gameProducts,
            };
          });
        }
      } catch (e) {
        console.warn("Fallback price-list ke seed data:", e);
      }
    }

    if (resultGames.length === 0) {
      resultGames = seedGames.map((g) => {
        const gameProducts = (seedProducts[g.slug] || []).map((p) => ({
          ...p,
          brand: g.title,
          status: p.is_active ? 1 : 0,
        }));

        return {
          id: g.id,
          title: g.title,
          slug: g.slug,
          logo: g.logo || g.image,
          products: gameProducts,
        };
      });
    }

    return NextResponse.json({
      success: true,
      data: resultGames,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat daftar harga",
      error: err?.message,
    }, { status: 500 });
  }
}
