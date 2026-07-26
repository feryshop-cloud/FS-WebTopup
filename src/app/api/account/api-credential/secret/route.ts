import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const newSecret = `TSON-SEC-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  return NextResponse.json({
    success: true,
    message: "Secret Key berhasil diperbarui",
    data: {
      secret_key: newSecret,
    },
  }, { status: 200 });
}