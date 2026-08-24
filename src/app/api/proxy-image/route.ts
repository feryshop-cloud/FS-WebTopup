import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getPlaceholderResponse() {
  try {
    const placeholderPath = path.join(process.cwd(), "public", "placeholder.png");
    if (fs.existsSync(placeholderPath)) {
      const fileBuffer = fs.readFileSync(placeholderPath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      });
    }
  } catch {}
  return NextResponse.json({ error: "Image not found" }, { status: 404 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const imagePath = url.searchParams.get("path") ?? "";

  if (!imagePath) {
    return NextResponse.json({ error: "Missing path" }, { status: 422 });
  }

  // 1. Jika imagePath sudah merupakan URL lengkap (http/https)
  if (/^https?:\/\//i.test(imagePath)) {
    try {
      const res = await fetch(imagePath, {
        headers: { Accept: "image/*" },
        next: { revalidate: 86400 },
      });

      if (!res.ok) {
        return getPlaceholderResponse();
      }

      const contentType = res.headers.get("content-type") ?? "image/webp";
      const buf = await res.arrayBuffer();

      return new NextResponse(buf, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
        },
      });
    } catch {
      return getPlaceholderResponse();
    }
  }

  // 2. Fetch dari Supabase Storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    return getPlaceholderResponse();
  }

  const cleanKey = imagePath.replace(/^\/+/, "");
  // Support baik path format 'storage/v1/object/public/images/...' maupun 'images/...'
  const targetUrl = cleanKey.startsWith("storage/v1/object/public/")
    ? `${supabaseUrl.replace(/\/+$/, "")}/${cleanKey}`
    : `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${cleanKey}`;

  try {
    const res = await fetch(targetUrl, {
      headers: { Accept: "image/*" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return getPlaceholderResponse();
    }

    const contentType = res.headers.get("content-type") ?? "image/webp";
    const buf = await res.arrayBuffer();

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return getPlaceholderResponse();
  }
}
