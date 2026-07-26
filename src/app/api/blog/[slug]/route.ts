import { NextResponse } from "next/server";
import { db, articles } from "@/lib/db";
import { eq } from "drizzle-orm";
import { seedArticles } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: any) {
  try {
    const slug = context?.params?.slug;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ success: false, message: "Slug tidak ditemukan" }, { status: 400 });
    }

    let foundArticle: any = null;

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbArticle = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
        if (dbArticle && dbArticle[0]) {
          const a = dbArticle[0];
          foundArticle = {
            id: a.id,
            title: a.title,
            slug: a.slug,
            thumbnail: a.thumbnail,
            excerpt: a.excerpt,
            content: a.content,
            author: a.author,
            views: a.views,
            created_at: a.createdAt,
          };
        }
      } catch (e) {
        console.warn(`Fallback blog [${slug}]:`, e);
      }
    }

    if (!foundArticle) {
      foundArticle = seedArticles.find((a) => a.slug === slug);
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