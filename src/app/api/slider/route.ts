import { NextResponse } from "next/server";
import { getSliderPayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getSliderPayload(), { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat slider",
        error: err?.message,
      },
      { status: 500 },
    );
  }
}
