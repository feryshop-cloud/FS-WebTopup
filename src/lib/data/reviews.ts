import { desc, eq } from "drizzle-orm";
import { db, reviews } from "@/lib/db";
import type { Review } from "@/lib/db/schema";
import { logger } from "@/lib/logger";

/** A single normalized review shown on the product reviews page. */
export type ReviewItem = {
  id: number;
  product: string | null;
  game: string | null;
  rating: number;
  review_text: string;
  reviewer_type: string;
  reviewer_display: string;
  created_at: string;
};

/** Pagination metadata returned alongside review rows. */
export type ReviewsMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

/** Payload shape for both the RSC page fetch and the `/api/reviews` route. */
export type ReviewsPayload = {
  success: boolean;
  data: ReviewItem[];
  meta: ReviewsMeta;
};

/** Fallback reviews used when the database is unavailable or empty. */
const SEED_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    product: "Mobile Legends: Bang Bang",
    game: "Mobile Legends: Bang Bang",
    rating: 5,
    review_text: "Proses top up MLBB super ngebut 3 detik langsung masuk!",
    reviewer_type: "verified",
    reviewer_display: "Budi S.",
    created_at: "2026-07-25T14:20:00Z",
  },
  {
    id: 2,
    product: "Valorant",
    game: "Valorant",
    rating: 5,
    review_text: "Harga paling murah dibanding website lain. Mantap Feryshop!",
    reviewer_type: "verified",
    reviewer_display: "Rizky A.",
    created_at: "2026-07-25T16:45:00Z",
  },
  {
    id: 3,
    product: "Mobile Legends: Bang Bang",
    game: "Mobile Legends: Bang Bang",
    rating: 5,
    review_text: "CS sangat ramah dan responsif saat tanya nominal WDP.",
    reviewer_type: "verified",
    reviewer_display: "Dinda M.",
    created_at: "2026-07-26T01:10:00Z",
  },
  {
    id: 4,
    product: "Free Fire",
    game: "Free Fire",
    rating: 5,
    review_text: "Bayar pakai QRIS praktis banget tanpa potongan fee berlebihan.",
    reviewer_type: "verified",
    reviewer_display: "Fajar W.",
    created_at: "2026-07-26T05:30:00Z",
  },
];

/**
 * Maps a raw `reviews` table row into the public `ReviewItem` shape.
 * @param r Raw review row from the database.
 * @returns Normalized review item.
 */
function normalizeDbReview(r: Review): ReviewItem {
  const createdAt =
    r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt ?? "");

  return {
    id: r.id,
    product: r.productTitle || null,
    game: r.gameSlug || r.productTitle || "Game Topup",
    rating: r.rating,
    review_text: r.comment || "",
    reviewer_type: "verified",
    reviewer_display: "Pelanggan Setia",
    created_at: createdAt,
  };
}

/** Environment variable feature flag that enables reviews from the database. */
export const REVIEWS_FEATURE_FLAG = "FS_PUBLIC_REVIEWS_DB_ENABLED";

/** Checks whether the database-reviews feature flag is on (no DB credentials check). */
export function isReviewsDatabaseEnabled(): boolean {
  return process.env[REVIEWS_FEATURE_FLAG] === "true";
}

/** Checks whether a database review query is worth attempting: flag on AND credentials configured. */
export function hasReviewsDatabaseEnabled(): boolean {
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) return false;
  return isReviewsDatabaseEnabled();
}

/**
 * Fetches a page of published reviews (newest first). Database is tried first,
 * falling back to seed data when unavailable, empty, or failing.
 * @param page 1-based page number.
 * @param perPage Number of reviews per page.
 * @returns Paginated payload with `data` (this page) and `meta` (total/last_page).
 */
export async function getReviewsPayload(page = 1, perPage = 12): Promise<ReviewsPayload> {
  let items: ReviewItem[] = [];
  let total = 0;
  let useSeed = true;

  if (hasReviewsDatabaseEnabled()) {
    try {
      const [dbReviews, countRow] = await Promise.all([
        db
          .select()
          .from(reviews)
          .where(eq(reviews.isPublished, true))
          .orderBy(desc(reviews.createdAt))
          .limit(perPage)
          .offset((page - 1) * perPage),
        db.$count(reviews, eq(reviews.isPublished, true)),
      ]);
      items = dbReviews.map(normalizeDbReview);
      total = countRow;
      useSeed = false;
    } catch (e) {
      logger.warn("Fallback reviews ke seed data", { error: e });
    }
  }

  if (useSeed) {
    const start = (page - 1) * perPage;
    items = SEED_REVIEWS.slice(start, start + perPage);
    total = SEED_REVIEWS.length;
  }

  return {
    success: true,
    data: items,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.max(1, Math.ceil(total / perPage)),
    },
  };
}
