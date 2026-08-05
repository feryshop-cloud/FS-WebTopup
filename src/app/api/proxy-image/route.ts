import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const s3 = new S3Client({
  region: process.env.REGION || "auto",
  endpoint: process.env.ENDPOINT,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
  },
});

const BUCKET = process.env.BUCKET || "";

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

  // Normalize: strip leading slash
  const key = imagePath.replace(/^\/+/, "");

  try {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

    // Try direct authenticated fetch first (faster than presigned URL)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    const res = await fetch(signedUrl, {
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
  } catch (err: any) {
    return getPlaceholderResponse();
  }
}
