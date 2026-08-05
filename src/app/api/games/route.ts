import { NextResponse } from "next/server";
import { getGamesPayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getGamesPayload(), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat katalog game",
        error: err?.message,
      },
      { status: 500 },
    );
  }
}
