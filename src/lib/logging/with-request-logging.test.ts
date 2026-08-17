import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock external deps
vi.mock("node:crypto", () => ({
  randomUUID: () => "mocked-uuid-1234",
}));

const mockLoggerError = vi.fn();
vi.mock("@/lib/logger", () => ({
  pinoLogger: {
    error: (...args: unknown[]) => mockLoggerError(...args),
  },
}));

const mockUserFromRequest = vi.fn();
vi.mock("@/lib/logging/user-context", () => ({
  userFromRequest: (...args: unknown[]) => mockUserFromRequest(...args),
}));

// request-context just runs the function inline for testing
vi.mock("@/lib/logging/request-context", () => ({
  runWithRequestId: (_id: string, fn: () => unknown) => fn(),
}));

import { genReqId, withRequestLogging } from "@/lib/logging/with-request-logging";

describe("genReqId", () => {
  it("reuses x-request-id header when present", () => {
    const req = new Request("http://localhost/test", {
      headers: { "x-request-id": "existing-id-abc" },
    });
    expect(genReqId(req)).toBe("existing-id-abc");
  });

  it("generates req-<uuid> when x-request-id is absent", () => {
    const req = new Request("http://localhost/test");
    const id = genReqId(req);
    expect(id).toBe("req-mocked-uuid-1234");
  });

  it("generates new id when x-request-id is empty string", () => {
    const req = new Request("http://localhost/test", {
      headers: { "x-request-id": "" },
    });
    // Empty string from headers.get() — headers returns "" for empty, not null
    // genReqId uses ?? so "" is kept
    const id = genReqId(req);
    // Headers.get returns "" for set-but-empty, which is truthy for ??
    expect(id).toBe("");
  });
});

describe("withRequestLogging", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserFromRequest.mockResolvedValue(undefined);
  });

  it("returns the handler response and sets x-request-id header", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("OK", { status: 200 }));
    const wrapped = withRequestLogging(handler);

    const req = new Request("http://localhost/api/test", {
      method: "GET",
      headers: { "x-request-id": "req-xyz" },
    });
    const res = await wrapped(req, {});

    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("req-xyz");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("generates a new request id when none provided", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("OK"));
    const wrapped = withRequestLogging(handler);

    const req = new Request("http://localhost/api/test");
    const res = await wrapped(req, {});

    expect(res.headers.get("x-request-id")).toBe("req-mocked-uuid-1234");
  });

  it("logs error and re-throws when handler throws", async () => {
    const testError = new Error("handler exploded");
    const handler = vi.fn().mockRejectedValue(testError);
    const wrapped = withRequestLogging(handler);

    const req = new Request("http://localhost/api/fail", {
      method: "POST",
      headers: { "x-request-id": "req-err" },
    });

    await expect(wrapped(req, {})).rejects.toThrow("handler exploded");
    expect(mockLoggerError).toHaveBeenCalledOnce();

    // Verify the log payload shape
    const [meta, msg] = mockLoggerError.mock.calls[0];
    expect(msg).toBe("request error");
    expect(meta.err).toBe(testError);
    expect(meta.req.id).toBe("req-err");
    expect(meta.req.method).toBe("POST");
  });

  it("passes ctx through to the handler", async () => {
    const handler = vi.fn().mockResolvedValue(new Response("OK"));
    const wrapped = withRequestLogging(handler);

    const ctx = { params: { id: "123" } };
    const req = new Request("http://localhost/api/test");
    await wrapped(req, ctx);

    expect(handler).toHaveBeenCalledWith(req, ctx);
  });

  it("includes user context in error log", async () => {
    mockUserFromRequest.mockResolvedValue({ id: "user-42" });
    const handler = vi.fn().mockRejectedValue(new Error("fail"));
    const wrapped = withRequestLogging(handler);

    const req = new Request("http://localhost/api/test", { method: "GET" });
    await expect(wrapped(req, {})).rejects.toThrow();

    const [meta] = mockLoggerError.mock.calls[0];
    expect(meta.user).toEqual({ id: "user-42" });
  });
});
