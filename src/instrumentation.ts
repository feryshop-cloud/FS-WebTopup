/**
 * @file instrumentation.ts
 * @description Next.js instrumentation hook for server lifecycle monitoring,
 * observability bootstrapping, and centralized server-side error logging.
 */

import { logger } from "@/lib/logger";
import { userFromRequest } from "@/lib/logging/user-context";

/**
 * Next.js instrumentation lifecycle hook called once when the server instance bootstraps.
 *
 * Use this hook to initialize OpenTelemetry SDK, APM agents, or global tracing providers.
 *
 * @see {@link https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation Next.js Instrumentation Docs}
 */
export async function register() {}

/**
 * Safely extracts a single header value from various header representations
 * (such as standard Fetch API `Headers` instance or plain key-value objects).
 *
 * @param headers - The incoming request headers object or instance.
 * @param name - The name of the header to retrieve (case-insensitive fallback supported).
 * @returns The string value of the header if found, or `null` if not present/invalid.
 */
function headerValue(headers: unknown, name: string): string | null {
  if (headers instanceof Headers) return headers.get(name);
  if (headers && typeof headers === "object") {
    const record = headers as Record<string, string | string[] | undefined>;
    const value = record[name] ?? record[name.toLowerCase()];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  }
  return null;
}

/**
 * Next.js error instrumentation hook called automatically when an unhandled error
 * occurs while processing a server request (Server Actions, Route Handlers, RSC render, or Middleware).
 *
 * Captures request context, tracing IDs (`x-request-id`), Server Action IDs, and authenticated user context
 * before delegating to the structured logger.
 *
 * @param err - The uncaught error or exception thrown during request lifecycle.
 * @param request - Contextual information regarding the failing request.
 * @param request.path - The URL path of the incoming request.
 * @param request.method - The HTTP method used (e.g., `GET`, `POST`).
 * @param request.headers - Request headers used to extract request ID, action ID, and user session context.
 */
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: unknown },
) {
  const actionId = headerValue(request.headers, "next-action");
  const isServerAction = actionId !== null;
  const context = isServerAction
    ? `ServerAction: ${request.path}`
    : `Route: ${request.method} ${request.path}`;

  logger.error("request error", {
    err,
    context,
    requestId: headerValue(request.headers, "x-request-id") ?? undefined,
    ...(isServerAction ? { actionId: actionId ?? undefined } : {}),
    user: await userFromRequest(request.headers as Headers),
  });
}
