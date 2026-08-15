import { NextResponse } from "next/server";
import { getPriceListPayload } from "@/lib/data/price-list";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

export const dynamic = "force-dynamic";

async function getHandler(request: Request) {
  try {
    const url = new URL(request.url);
    const gameSlug = url.searchParams.get("game") || undefined;

    const payload = await getPriceListPayload(gameSlug);

    return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    logger.error("price-list failed", { error: err });
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat daftar harga",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}

export const GET = withRequestLogging(getHandler);
