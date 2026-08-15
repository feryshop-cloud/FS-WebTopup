import { NextResponse } from "next/server";
import { getReviewsPayload } from "@/lib/data/reviews";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const perPage = Number(url.searchParams.get("per_page") || "12");

    return NextResponse.json(await getReviewsPayload(page, perPage), { status: 200 });
  } catch (err: any) {
    logger.error("reviews failed", { error: err });
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
