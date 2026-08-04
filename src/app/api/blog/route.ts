import { NextResponse } from "next/server";
import { db, articles } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { hasArticleDatabaseEnabled, getSeedArticles, normalizeArticle } from "@/lib/data/articles";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allArticles = getSeedArticles();

    if (hasArticleDatabaseEnabled()) {
      try {
        const dbArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
        if (dbArticles && dbArticles.length > 0) {
          allArticles = dbArticles.map(normalizeArticle);
        }
      } catch (e) {
        logger.warn("Fallback blog ke dummy data", { error: e });
      }
    }

    return NextResponse.json({
      success: true,
      data: allArticles,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat blog",
      error: err?.message,
    }, { status: 500 });
  }
}