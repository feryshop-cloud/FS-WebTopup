import { randomUUID } from "node:crypto";
import { logger } from "@/lib/logger";
import { runWithRequestId } from "@/lib/logging/request-context";

export type RouteHandler<C = unknown> = (
  req: Request,
  ctx: C,
) => Promise<Response> | Response;

/**
 * Wraps a Next.js App Router route handler with structured request logging:
 * - binds `requestId` (reused from `x-request-id` header or freshly generated) so every
 *   logger call inside the handler carries the same correlation id,
 * - logs method / path / status / duration on completion,
 * - echoes the requestId on the response `x-request-id` header.
 */
export function withRequestLogging<C = unknown>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (req, ctx) => {
    const requestId = req.headers.get("x-request-id") ?? randomUUID();
    const method = req.method ?? "GET";
    const url = req.url ?? "";
    let path: string;
    try {
      path = new URL(url).pathname;
    } catch {
      path = url;
    }
    const start = performance.now();

    return runWithRequestId(requestId, async () => {
      const res = await handler(req, ctx);
      logger.info("request completed", {
        method,
        path,
        status: res.status,
        durationMs: Math.round(performance.now() - start),
      });
      res.headers.set("x-request-id", requestId);
      return res;
    });
  };
}