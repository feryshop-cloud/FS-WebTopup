import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const newKey = `TSON-KEY-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  return NextResponse.json({
    success: true,
    message: "API Key berhasil diperbarui",
    data: {
      api_key: newKey,
    },
  }, { status: 200 });
}