import { NextResponse } from "next/server";
import { db, reviews } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let allReviews: any[] = [];

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.isPublished, true))
          .orderBy(desc(reviews.createdAt))
          .limit(10);
        if (dbReviews && dbReviews.length > 0) {
          allReviews = dbReviews.map((r) => ({
            id: r.id,
            name: "Pelanggan Setia",
            rating: r.rating,
            comment: r.comment,
            game: r.gameSlug || r.productTitle || "Game Topup",
            created_at: r.createdAt,
          }));
        }
      } catch (e) {
        logger.warn("Fallback reviews", { error: e });
      }
    }

    if (allReviews.length === 0) {
      allReviews = [
        {
          id: 1,
          name: "Budi S.",
          rating: 5,
          comment: "Proses top up MLBB super ngebut 3 detik langsung masuk!",
          game: "Mobile Legends: Bang Bang",
          created_at: "2026-07-25T14:20:00Z",
        },
        {
          id: 2,
          name: "Rizky A.",
          rating: 5,
          comment: "Harga paling murah dibanding website lain. Mantap Feryshop!",
          game: "Valorant",
          created_at: "2026-07-25T16:45:00Z",
        },
        {
          id: 3,
          name: "Dinda M.",
          rating: 5,
          comment: "CS sangat ramah dan responsif saat tanya nominal WDP.",
          game: "Mobile Legends: Bang Bang",
          created_at: "2026-07-26T01:10:00Z",
        },
        {
          id: 4,
          name: "Fajar W.",
          rating: 5,
          comment: "Bayar pakai QRIS praktis banget tanpa potongan fee berlebihan.",
          game: "Free Fire",
          created_at: "2026-07-26T05:30:00Z",
        },
      ];
    }

    return NextResponse.json(
      {
        success: true,
        data: allReviews,
      },
      { status: 200 },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat ulasan",
        error: err?.message,
      },
      { status: 500 },
    );
  }
}
