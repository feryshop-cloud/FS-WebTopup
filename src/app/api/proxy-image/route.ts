import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const imagePath = url.searchParams.get("path") ?? "";

  if (!imagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 422 });
  }

  // Jika imagePath sudah merupakan URL lengkap, fetch langsung
  let targetUrl = imagePath;
  if (!imagePath.startsWith("http://") && !imagePath.startsWith("https://")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      targetUrl = `${supabaseUrl}/storage/v1/object/public/images/${imagePath.replace(/^\//, '')}`;
    } else {
      // Fallback lokal jika tidak memakai Supabase storage
      return NextResponse.redirect(new URL(`/images/${imagePath.replace(/^\//, '')}`, req.url));
    }
  }

  try {
    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        Accept: "image/*",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: res.status });
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const buf = await res.arrayBuffer();

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Image fetch error", details: err?.message }, { status: 500 });
  }
}