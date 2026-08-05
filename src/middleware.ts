import { NextResponse, type NextRequest } from "next/server";
import { formatLog } from "@/lib/logging/format";

export function middleware(request: NextRequest) {
  const incomingId = request.headers.get("x-request-id");
  const requestId = incomingId || crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-request-id", requestId);

  console.log(
    formatLog(
      "info",
      "request start",
      {
        method: request.method,
        path: request.nextUrl.pathname,
      },
      { service: "FS-Public", requestId },
    ),
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
