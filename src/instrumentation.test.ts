import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock logger
const mockLoggerError = vi.fn();
vi.mock("@/lib/logger", () => ({
  logger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock user-context
const mockUserFromRequest = vi.fn();
vi.mock("@/lib/logging/user-context", () => ({
  userFromRequest: (...args: unknown[]) => mockUserFromRequest(...args),
}));

import { onRequestError } from "@/instrumentation";

// headerValue is not exported, so we test it indirectly through onRequestError.
// We can also re-implement it here for direct testing since it's a pure function.
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

describe("headerValue", () => {
  it("extracts value from Headers instance", () => {
    const headers = new Headers({ "content-type": "application/json" });
    expect(headerValue(headers, "content-type")).toBe("application/json");
  });

  it("returns null for missing header on Headers instance", () => {
    const headers = new Headers();
    expect(headerValue(headers, "x-missing")).toBeNull();
  });

  it("extracts value from plain object", () => {
    const headers = { "x-request-id": "req-123" };
    expect(headerValue(headers, "x-request-id")).toBe("req-123");
  });

  it("falls back to lowercase key in plain object", () => {
    const headers = { "x-request-id": "req-456" };
    // name "X-Request-Id" is not in record, but toLowerCase() = "x-request-id" is
    expect(headerValue(headers, "X-Request-Id")).toBe("req-456");
    // direct match also works
    expect(headerValue(headers, "x-request-id")).toBe("req-456");
  });

  it("prefers exact key over lowercase fallback", () => {
    const headers = { "X-Custom": "exact", "x-custom": "lower" };
    expect(headerValue(headers, "X-Custom")).toBe("exact");
  });

  it("handles array values (returns first element)", () => {
    const headers = { accept: ["text/html", "application/json"] };
    expect(headerValue(headers, "accept")).toBe("text/html");
  });

  it("returns null for empty array values", () => {
    const headers = { accept: [] as string[] };
    expect(headerValue(headers, "accept")).toBeNull();
  });

  it("returns null for undefined value in plain object", () => {
    const headers = { "x-custom": undefined };
    expect(headerValue(headers, "x-custom")).toBeNull();
  });

  it("returns null for null/unknown headers input", () => {
    expect(headerValue(null, "any")).toBeNull();
    expect(headerValue(undefined, "any")).toBeNull();
    expect(headerValue("string", "any")).toBeNull();
    expect(headerValue(42, "any")).toBeNull();
  });
});

describe("onRequestError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFromRequest.mockResolvedValue(undefined);
  });

  it("logs error with route context for non-server-action requests", async () => {
    const err = new Error("render failed");
    const headers = new Headers({ "x-request-id": "req-abc" });

    await onRequestError(err, {
      path: "/api/products",
      method: "GET",
      headers,
    });

    expect(mockLoggerError).toHaveBeenCalledOnce();
    const [msg, meta] = mockLoggerError.mock.calls[0];
    expect(msg).toBe("request error");
    expect(meta.err).toBe(err);
    expect(meta.context).toBe("Route: GET /api/products");
    expect(meta.requestId).toBe("req-abc");
    expect(meta).not.toHaveProperty("actionId");
  });

  it("logs error with ServerAction context when next-action header present", async () => {
    const err = new Error("action failed");
    const headers = new Headers({
      "next-action": "action-xyz-123",
      "x-request-id": "req-def",
    });

    await onRequestError(err, {
      path: "/checkout",
      method: "POST",
      headers,
    });

    expect(mockLoggerError).toHaveBeenCalledOnce();
    const [msg, meta] = mockLoggerError.mock.calls[0];
    expect(msg).toBe("request error");
    expect(meta.context).toBe("ServerAction: /checkout");
    expect(meta.actionId).toBe("action-xyz-123");
    expect(meta.requestId).toBe("req-def");
  });

  it("includes user context from userFromRequest", async () => {
    mockUserFromRequest.mockResolvedValue({ id: "user-99" });
    const err = new Error("forbidden");
    const headers = new Headers();

    await onRequestError(err, {
      path: "/admin",
      method: "GET",
      headers,
    });

    const [, meta] = mockLoggerError.mock.calls[0];
    expect(meta.user).toEqual({ id: "user-99" });
  });

  it("handles missing x-request-id gracefully", async () => {
    const err = new Error("oops");
    const headers = new Headers();

    await onRequestError(err, {
      path: "/test",
      method: "POST",
      headers,
    });

    const [, meta] = mockLoggerError.mock.calls[0];
    expect(meta.requestId).toBeUndefined();
  });

  it("handles plain object headers", async () => {
    const err = new Error("fail");
    const headers = {
      "x-request-id": "req-plain",
      "next-action": "act-plain",
    };

    await onRequestError(err, {
      path: "/action",
      method: "POST",
      headers,
    });

    const [, meta] = mockLoggerError.mock.calls[0];
    expect(meta.requestId).toBe("req-plain");
    expect(meta.actionId).toBe("act-plain");
    expect(meta.context).toBe("ServerAction: /action");
  });

  it("handles non-Error thrown values", async () => {
    await onRequestError("string error", {
      path: "/api/test",
      method: "GET",
      headers: new Headers(),
    });

    expect(mockLoggerError).toHaveBeenCalledOnce();
    const [, meta] = mockLoggerError.mock.calls[0];
    expect(meta.err).toBe("string error");
  });
});
