import { NextResponse } from "next/server";
import { getPromoPayload } from "@/lib/data/home";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getPromoPayload(), { status: 200 });
}
