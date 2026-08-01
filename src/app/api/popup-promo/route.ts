import { NextResponse } from "next/server";
import { getPopupPromoPayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPopupPromoPayload(), { status: 200 });
}
