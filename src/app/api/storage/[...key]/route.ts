import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ key?: string[] }> }) {
  const params = await context.params;
  const keyParts = params.key ?? [];
  const key = keyParts.join("/");

  if (!key || key.includes("..")) {
    return NextResponse.json(
      { success: false, message: "Path storage tidak valid" },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { success: false, message: "Supabase URL belum dikonfigurasi" },
      { status: 500 },
    );
  }

  // Arahkan ke endpoint public Supabase Storage
  const targetUrl = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${key}`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok || !response.body) {
      return NextResponse.json(
        { success: false, message: "Object tidak ditemukan di Supabase Storage" },
        { status: response.status },
      );
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "content-type": response.headers.get("content-type") || "application/octet-stream",
        "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil object dari Supabase Storage" },
      { status: 500 },
    );
  }
}
