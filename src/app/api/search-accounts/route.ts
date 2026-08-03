import { NextResponse } from "next/server";
import { searchLiveMarketplace } from "@/lib/marketplace/live-marketplace";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const gameSlug = url.searchParams.get("gameSlug") || undefined;

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const accounts = await searchLiveMarketplace(query, gameSlug);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Error in search-accounts API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
