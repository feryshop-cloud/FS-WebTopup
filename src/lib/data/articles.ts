import { seedArticles } from "@/lib/db/seed-data";
import type { Article } from "@/lib/db/schema";

export type ArticleRecord = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  excerpt: string | null;
  content: string;
  author: string;
  views: number;
  created_at: string;
};

export const ARTICLE_FEATURE_FLAG = "FS_PUBLIC_ARTICLES_DB_ENABLED";

export function isArticlesDatabaseEnabled(): boolean {
  return process.env[ARTICLE_FEATURE_FLAG] === "true";
}

export function hasArticleDatabaseEnabled(): boolean {
  if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) return false;
  return isArticlesDatabaseEnabled();
}

export function getSeedArticles(): ArticleRecord[] {
  return seedArticles as unknown as ArticleRecord[];
}

export function normalizeArticle(a: Article): ArticleRecord {
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    thumbnail: a.thumbnail,
    excerpt: a.excerpt,
    content: a.content,
    author: a.author ?? "",
    views: a.views ?? 0,
    created_at: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
  };
}
