import { NextResponse } from "next/server";
import { db, articles } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { seedArticles } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const perPage = Number(url.searchParams.get("per_page") || "9");

    let allArticles: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
        if (dbArticles && dbArticles.length > 0) {
          allArticles = dbArticles.map((a) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            thumbnail: a.thumbnail,
            excerpt: a.excerpt,
            content: a.content,
            author: a.author,
            views: a.views,
            created_at: a.createdAt,
          }));
        }
      } catch (e) {
        console.warn("Fallback blog-lite:", e);
      }
    }

    if (allArticles.length === 0) {
      allArticles = seedArticles;
    }

    const start = (page - 1) * perPage;
    const paginated = allArticles.slice(start, start + perPage);

    return NextResponse.json({
      success: true,
      data: {
        data: paginated,
        total: allArticles.length,
        current_page: page,
        last_page: Math.max(1, Math.ceil(allArticles.length / perPage)),
      },
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memuat artikel",
      error: err?.message,
    }, { status: 500 });
  }
}
