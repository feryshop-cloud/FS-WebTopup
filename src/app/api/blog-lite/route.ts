import { NextResponse } from "next/server";
import { getBlogLitePayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || "1");
    const perPage = Number(url.searchParams.get("per_page") || "9");

    return NextResponse.json(await getBlogLitePayload(page, perPage), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat artikel",
        error: err?.message,
      },
      { status: 500 },
    );
  }
}
