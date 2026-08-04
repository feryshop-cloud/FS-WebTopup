import { NextResponse } from "next/server";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import { getLivePublicGames, getLivePublicProducts } from "@/lib/db/live-adapter";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

export const dynamic = "force-dynamic";

async function getHandler() {
  try {
    const [liveGames, liveProducts] = await Promise.all([
      getLivePublicGames(),
      getLivePublicProducts(),
    ]);

    logger.info("price-list fetched live data", {
      liveGames: liveGames.length,
      liveProducts: liveProducts.length,
    });

    let resultGames: any[] = [];

    if (liveGames.length > 0) {
      resultGames = liveGames.map((game) => {
        const gameProductsFromDb = liveProducts
          .filter((product) => {
            const pSlug = (product.game_slug || "").toLowerCase();
            const pBrand = (product.brand || "").toLowerCase();
            const gSlug = (game.slug || "").toLowerCase();
            const gTitle = (game.title || "").toLowerCase();
            return pSlug === gSlug || pSlug === gTitle || pBrand === gSlug || pBrand === gTitle;
          })
          .map((product) => ({
            id: product.id,
            title: product.title,
            brand: product.brand || game.title,
            selling_price: Number(product.selling_price),
            selling_price_gold: product.selling_price_gold ? Number(product.selling_price_gold) : Number(product.selling_price),
            selling_price_platinum: product.selling_price_platinum ? Number(product.selling_price_platinum) : Number(product.selling_price),
            status: product.is_gangguan ? 0 : (product.is_active ? 1 : 0),
            is_active: product.is_active,
            logo: product.logo || product.images || game.logo || game.image || null,
          }));

        const finalProducts = gameProductsFromDb.length > 0
          ? gameProductsFromDb
          : (seedProducts[game.slug] || []).map((product) => ({
              ...product,
              brand: game.title,
              status: product.is_active ? 1 : 0,
              logo: product.logo || product.images || game.logo || game.image || null,
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

    if (resultGames.length === 0) {
      logger.warn("price-list fell back to seed games");
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

    const isLive = liveGames.length > 0;
    logger.info("price-list source", {
      source: isLive ? "live_supabase" : "seed_fallback",
      games: resultGames.length,
    });

    return NextResponse.json({
      success: true,
      source: isLive ? "live_supabase" : "seed_fallback",
      data: resultGames,
    }, { status: 200 });
  } catch (err: unknown) {
    logger.error("price-list failed", { error: err });
    return NextResponse.json({
      success: false,
      message: "Gagal memuat daftar harga",
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}

export const GET = withRequestLogging(getHandler);
