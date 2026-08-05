import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ALLOWED_KEY_PATTERN = /^games\/(banner|image|logo)\/[^/][\w./-]*$/;

function hmacBuffer(key: crypto.BinaryLike | crypto.KeyObject, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function hmacHex(key: crypto.BinaryLike | crypto.KeyObject, data: string) {
  return crypto.createHmac("sha256", key).update(data).digest("hex");
}

function hash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function getStorageConfig() {
  const bucket = process.env.BUCKET?.trim();
  const endpoint = process.env.ENDPOINT?.trim().replace(/\/+$/, "");
  const region = process.env.REGION?.trim();
  const accessKeyId = process.env.ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.SECRET_ACCESS_KEY?.trim();

  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    bucket,
    endpoint,
    region,
    accessKeyId,
    secretAccessKey,
  };
}

async function fetchObject(key: string) {
  const config = getStorageConfig();
  if (!config) {
    return NextResponse.json(
      { success: false, message: "Storage belum dikonfigurasi" },
      { status: 500 },
    );
  }

  const url = new URL(
    `${config.endpoint}/${encodeRfc3986(config.bucket)}/${key.split("/").map(encodeRfc3986).join("/")}`,
  );
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalQuery = "";
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "GET",
    url.pathname,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join(
    "\n",
  );
  const kDate = hmacBuffer(`AWS4${config.secretAccessKey}`, dateStamp);
  const kRegion = hmacBuffer(kDate, config.region);
  const kService = hmacBuffer(kRegion, "s3");
  const kSigning = hmacBuffer(kService, "aws4_request");
  const signature = hmacHex(kSigning, stringToSign);
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    headers: {
      "x-amz-date": amzDate,
      "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
      authorization,
    },
  });

  if (!response.ok || !response.body) {
    return NextResponse.json(
      { success: false, message: "Object tidak ditemukan" },
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
}

export async function GET(_request: Request, context: { params: Promise<{ key?: string[] }> }) {
  const params = await context.params;
  const key = params.key?.join("/") ?? "";

  if (!ALLOWED_KEY_PATTERN.test(key) || key.includes("..")) {
    return NextResponse.json(
      { success: false, message: "Path storage tidak valid" },
      { status: 400 },
    );
  }

  return fetchObject(key);
}
