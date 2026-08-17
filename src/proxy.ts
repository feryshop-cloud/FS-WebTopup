/**
 * @file proxy.ts
 * @description Next.js proxy middleware responsible for request correlation tracking
 * (via `x-request-id`), early 404 fast-path intercept for nonexistent routes,
 * and forwarding enriched request headers downstream.
 */

import { NextResponse, type NextRequest } from "next/server";
import { shouldReturnNotFound } from "@/lib/middleware/route-exists";

/**
 * Self-contained static HTML page returned for 404 Not Found responses.
 *
 * Rendered directly at the Edge/Middleware layer to provide zero-cost early exits
 * for invalid route requests (scanners/bots) without invoking SSR or React rendering pipelines.
 */
const NOT_FOUND_HTML = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>404 - Halaman Tidak Ditemukan | Feryshop</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0f;color:#e5e5e5;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:1rem}
    .box{text-align:center;max-width:28rem}
    h1{font-size:6rem;margin:0;color:#f87171;font-weight:800;letter-spacing:-.05em}
    p{font-size:1.05rem;line-height:1.6;color:#a3a3a3;margin:.75rem 0 1.5rem}
    a{display:inline-block;background:#facc15;color:#000;text-decoration:none;font-weight:600;padding:.6rem 1.4rem;border-radius:.5rem}
  </style>
</head>
<body>
  <div class="box">
    <h1>404</h1>
    <p>Oops! Halaman yang Anda cari tidak ditemukan.</p>
    <a href="/">Kembali ke Halaman Utama</a>
  </div>
</body>
</html>`;

/**
 * Core middleware proxy handler.
 *
 * 1. Generates or propagates incoming `x-request-id` header for distributed tracing.
 * 2. Checks route validity via {@link shouldReturnNotFound}. If unknown, immediately serves {@link NOT_FOUND_HTML}.
 * 3. Injects `x-request-id` into downstream request and response headers.
 *
 * @param request - The incoming Next.js HTTP request.
 * @returns A Next.js response (either 404 early-exit or downstream NextResponse with tracking headers).
 */
export async function proxy(request: NextRequest) {
  const incomingId = request.headers.get("x-request-id");
  const requestId = incomingId || crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  if (await shouldReturnNotFound(request.nextUrl.pathname)) {
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: {
        "x-request-id": requestId,
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-request-id", requestId);

  return response;
}

/**
 * Middleware matcher configuration.
 *
 * Excludes static assets (`_next/static`, `_next/image`, images, fonts, JS, CSS)
 * and health check endpoints (`/api/health`) from middleware execution to maximize throughput.
 */
export const config = {
  matcher: [
    "/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
