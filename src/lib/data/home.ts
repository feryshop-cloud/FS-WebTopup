import { asc, desc, eq } from "drizzle-orm";

import { db, articles, categories, games } from "@/lib/db";
import { getLivePublicGames, shouldQueryLegacyStorefrontSchema } from "@/lib/db/live-adapter";
import { seedCategories, seedGames, seedSliders } from "@/lib/db/seed-data";
import { getSeedArticles, hasArticleDatabaseEnabled, normalizeArticle } from "@/lib/data/articles";

export type HomeFallbackData = {
  slider: Awaited<ReturnType<typeof getSliderPayload>>;
  categories: Awaited<ReturnType<typeof getCategoriesPayload>>;
  games: Awaited<ReturnType<typeof getGamesPayload>>;
  promo: Awaited<ReturnType<typeof getPromoPayload>>;
  popupPromo: Awaited<ReturnType<typeof getPopupPromoPayload>>;
  blogLite: Awaited<ReturnType<typeof getBlogLitePayload>>;
};

export async function getSliderPayload() {
  return {
    success: true,
    data: seedSliders,
  };
}

export async function getGamesPayload() {
  let allGames: any[] = await getLivePublicGames();

  if (allGames.length === 0 && shouldQueryLegacyStorefrontSchema()) {
    try {
      const dbGames = await db.select().from(games).where(eq(games.isActive, true)).orderBy(asc(games.sortOrder));
      if (dbGames.length > 0) {
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
    } catch (error) {
      console.warn("Fallback ke seed games karena kueri Supabase gagal/belum disetup:", error);
    }
  }

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

  return {
    success: true,
    games: allGames,
    populerGames: populerGames.length > 0 ? populerGames : allGames.slice(0, 4),
  };
}

export async function getCategoriesPayload() {
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

  if (allCategories.length === 0 && shouldQueryLegacyStorefrontSchema()) {
    try {
      const dbCategories = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
      if (dbCategories.length > 0) {
        allCategories = dbCategories.map((c) => ({
          id: c.id,
          title: c.title,
          logo: c.logo,
          game: c.gameSlug || c.title,
        }));
      }
    } catch (error) {
      console.warn("Fallback ke seed categories:", error);
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

  return {
    success: true,
    data: allCategories,
  };
}

export async function getPromoPayload() {
  return {
    success: true,
    data: [
      {
        id: 1,
        title: "Diskon Weekly Pass MLBB",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        description: "Potongan harga spesial untuk Weekly Diamond Pass selama periode promo.",
        url: "/order/mobile-legends",
      },
      {
        id: 2,
        title: "Cashback QRIS 5%",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
        description: "Gunakan metode pembayaran QRIS untuk mendapatkan potongan langsung.",
        url: "/order/valorant",
      },
    ],
  };
}

export async function getPopupPromoPayload() {
  return {
    success: true,
    data: {
      id: 1,
      title: "Selamat Datang di Feryshop!",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
      description: "Nikmati kemudahan top up game 24 jam dengan harga termurah & proses instan.",
      url: "/order/mobile-legends",
      is_active: false,
    },
  };
}

export async function getBlogLitePayload(page = 1, perPage = 6) {
  let allArticles = getSeedArticles();

  if (hasArticleDatabaseEnabled()) {
    try {
      const dbArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
      if (dbArticles.length > 0) {
        allArticles = dbArticles.map(normalizeArticle);
      }
    } catch (error) {
      console.warn("Fallback blog-lite ke dummy data:", error);
    }
  }

  const start = (page - 1) * perPage;
  const paginated = allArticles.slice(start, start + perPage);

  return {
    success: true,
    data: {
      data: paginated,
      total: allArticles.length,
      current_page: page,
      last_page: Math.max(1, Math.ceil(allArticles.length / perPage)),
    },
  };
}

export async function getHomeFallbackData(): Promise<HomeFallbackData> {
  const [slider, games, categories, promo, popupPromo, blogLite] = await Promise.all([
    getSliderPayload(),
    getGamesPayload(),
    getCategoriesPayload(),
    getPromoPayload(),
    getPopupPromoPayload(),
    getBlogLitePayload(1, 6),
  ]);

  return {
    slider,
    games,
    categories,
    promo,
    popupPromo,
    blogLite,
  };
}
