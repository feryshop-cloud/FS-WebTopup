import { NextResponse } from "next/server";
import { db, articles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { hasArticleDatabaseEnabled, getSeedArticles, normalizeArticle, type ArticleRecord } from "@/lib/data/articles";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: any) {
  try {
    const slug = context?.params?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, message: "Slug tidak ditemukan" }, { status: 400 });
    }

    const seed = getSeedArticles();
    let foundArticle: ArticleRecord | null = null;

    if (hasArticleDatabaseEnabled()) {
      try {
        const dbArticle = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
        if (dbArticle && dbArticle[0]) {
          foundArticle = normalizeArticle(dbArticle[0]);
        }
      } catch (e) {
        console.warn(`Fallback blog [${slug}] ke dummy data:`, e);
      }
    }

    if (!foundArticle) {
      foundArticle = seed.find((a) => a.slug === slug) ?? null;
    }

    if (!foundArticle) {
      return NextResponse.json({ success: false, message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: foundArticle,
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan",
      error: err?.message,
    }, { status: 500 });
  }
}