import { unstable_cache } from "next/cache";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import {
  getLivePublicGames,
  getLivePublicProducts,
  isSupabaseLiveConfigured,
} from "@/lib/db/live-adapter";
import { MEMBER_PRICE_FLAG } from "@/lib/pricing";
import { logger } from "@/lib/logger";

/** Lightweight game entry used for the price-list dropdown (no products). */
export type PriceListGame = {
  id: number | string;
  title: string;
  slug: string;
  logo: string | null;
};

/** Full game entry including its price-list products. */
export type PriceListGameEntry = {
  id: number | string;
  title: string;
  game_name: string;
  name: string;
  slug: string;
  logo: string | null;
  products: any[];
};

/** Cache tags used by revalidate endpoints (`catalog-categories` is whitelisted there). */
const CATEGORY_CACHE_TAGS = ["catalog-categories"] as const;

/**
 * Returns the lightweight list of games/categories for the Price List dropdown,
 * cached under the `catalog-categories` tag. Live Supabase data first, seed fallback.
 * @returns Deduplicated game list (id, title, slug, logo) — no product rows.
 */
export const getPriceListGames = unstable_cache(
  async (): Promise<PriceListGame[]> => {
    if (isSupabaseLiveConfigured()) {
      const live = await getLivePublicGames();
      if (live.length > 0) {
        return live.map((g) => ({
          id: g.id,
          title: g.title,
          slug: g.slug,
          logo: g.logo || null,
        }));
      }
    }

    return seedGames.map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      logo: g.logo || g.image || null,
    }));
  },
  ["price-list-games"],
  { revalidate: 60, tags: [...CATEGORY_CACHE_TAGS] },
);

/**
 * Builds the full price-list payload (games with their products).
 * When `gameSlug` is provided, only that game is returned — keeping the
 * response small for per-game fetches on the client.
 * @param gameSlug Optional slug to filter to a single game.
 * @returns `{ success, source, data }` where data is a `PriceListGameEntry[]`.
 */
export async function getPriceListPayload(gameSlug?: string) {
  let allGames: any[] = [];

  if (isSupabaseLiveConfigured()) {
    const [liveGames, liveProducts] = await Promise.all([
      getLivePublicGames(),
      getLivePublicProducts(),
    ]);

    logger.info("price-list fetched live data", {
      liveGames: liveGames.length,
      liveProducts: liveProducts.length,
    });

    allGames = liveGames.map((game) => {
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
          ...(MEMBER_PRICE_FLAG
            ? {
                selling_price_gold: product.selling_price_gold
                  ? Number(product.selling_price_gold)
                  : Number(product.selling_price),
                selling_price_platinum: product.selling_price_platinum
                  ? Number(product.selling_price_platinum)
                  : Number(product.selling_price),
              }
            : {}),
          status: product.is_gangguan ? 0 : product.is_active ? 1 : 0,
          is_active: product.is_active,
          logo: product.logo || product.images || game.logo || game.image || null,
        }));

      const finalProducts =
        gameProductsFromDb.length > 0
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

  if (allGames.length === 0) {
    logger.warn("price-list fell back to seed games");
    allGames = seedGames.map((g) => {
      const gameProducts = (seedProducts[g.slug] || []).map((p) => ({
        ...p,
        brand: g.title,
        status: p.is_active ? 1 : 0,
      }));

      return {
        id: g.id,
        title: g.title,
        game_name: g.title,
        name: g.title,
        slug: g.slug,
        logo: g.logo || g.image,
        products: gameProducts,
      };
    });
  }

  const resultGames =
    gameSlug && allGames.some((g) => g.slug === gameSlug)
      ? allGames.filter((g) => g.slug === gameSlug)
      : allGames;

  const isLive = isSupabaseLiveConfigured() && allGames.length > 0;
  logger.info("price-list source", {
    source: isLive ? "live_supabase" : "seed_fallback",
    games: resultGames.length,
    filtered: Boolean(gameSlug),
  });

  return {
    success: true,
    source: isLive ? "live_supabase" : "seed_fallback",
    data: resultGames,
  };
}
