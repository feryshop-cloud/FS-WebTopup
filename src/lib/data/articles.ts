import { seedArticles } from "@/lib/db/seed-data";
import { db, articles } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { Article } from "@/lib/db/schema";

export type ArticleRecord = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  image: string | null;
  excerpt: string | null;
  content: string;
  author: string;
  views: number;
  created_at: string;
  published_at: string;
  category: {
    id: number;
    title: string;
    slug: string;
  } | null;
};

/** Environment variable feature flag that enables articles from the database. */
export const ARTICLE_FEATURE_FLAG = "FS_PUBLIC_ARTICLES_DB_ENABLED";

/** Checks whether the database-articles feature flag is on (no DB credentials check). */
export function isArticlesDatabaseEnabled(): boolean {
  return process.env[ARTICLE_FEATURE_FLAG] === "true";
}

/**
 * Checks whether database article access is available: flag enabled AND DB credentials configured.
 * @returns `true` when a database query is worth attempting.
 */
export function hasArticleDatabaseEnabled(): boolean {
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) return false;
  return isArticlesDatabaseEnabled();
}

/**
 * Returns the fallback (seed) article list as normalized `ArticleRecord[]`.
 * @returns All seed articles, normalized.
 */
export function getSeedArticles(): ArticleRecord[] {
  return (seedArticles as any[]).map((article, index) => normalizeSeedArticle(article, index));
}

/**
 * Fetches a single article by slug. The database is tried first (when enabled),
 * then falls back to seed data when not found or the DB query fails.
 * @param slug Unique article slug (e.g. `mobile-legends-patch-notes`).
 * @returns The `ArticleRecord` when found, or `null` when absent from both DB and seed.
 */
export async function getArticleBySlug(slug: string): Promise<ArticleRecord | null> {
  if (!hasArticleDatabaseEnabled()) {
    return getSeedArticles().find((a) => a.slug === slug) ?? null;
  }

  try {
    const dbArticle = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (dbArticle && dbArticle[0]) {
      return normalizeArticle(dbArticle[0]);
    }
  } catch {
    // fallback ke dummy data bila DB bermasalah
  }

  return getSeedArticles().find((a) => a.slug === slug) ?? null;
}

export function normalizeArticle(a: Article): ArticleRecord {
  const publishedAt = a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt;

  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnail: a.thumbnail,
    image: a.thumbnail,
    excerpt: a.excerpt,
    content: a.content,
    author: a.author ?? "",
    views: a.views ?? 0,
    created_at: publishedAt,
    published_at: publishedAt,
    category: {
      id: 1,
      title: "Berita",
      slug: "berita",
    },
  };
}

function normalizeSeedArticle(article: any, index: number): ArticleRecord {
  const image = article.image ?? article.thumbnail ?? null;
  const publishedAt = article.published_at ?? article.created_at ?? new Date().toISOString();

  return {
    id: Number(article.id ?? index + 1),
    title: String(article.title ?? "Artikel Feryshop"),
    slug: String(article.slug ?? `artikel-feryshop-${index + 1}`),
    thumbnail: image,
    image,
    excerpt: article.excerpt ?? null,
    content: String(article.content ?? ""),
    author: String(article.author ?? "Admin Feryshop"),
    views: Number(article.views ?? 0),
    created_at: publishedAt,
    published_at: publishedAt,
    category: article.category ?? {
      id: 1,
      title: "Berita",
      slug: "berita",
    },
  };
}
