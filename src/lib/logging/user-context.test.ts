import { describe, expect, it, vi, beforeEach } from "vitest";

const mockGetToken = vi.fn();
vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

import { userFromRequest } from "@/lib/logging/user-context";

describe("userFromRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  it("returns user id from token.userId when authenticated", async () => {
    mockGetToken.mockResolvedValue({ userId: "user-123", sub: "sub-456" });
    const headers = new Headers({ cookie: "next-auth.session-token=abc123" });
    const result = await userFromRequest(headers);
    expect(result).toEqual({ id: "user-123" });
  });

  it("falls back to token.sub when userId is absent", async () => {
    mockGetToken.mockResolvedValue({ sub: "sub-789" });
    const headers = new Headers({ cookie: "next-auth.session-token=abc" });
    const result = await userFromRequest(headers);
    expect(result).toEqual({ id: "sub-789" });
  });

  it("returns undefined when token is null (unauthenticated)", async () => {
    mockGetToken.mockResolvedValue(null);
    const headers = new Headers();
    const result = await userFromRequest(headers);
    expect(result).toBeUndefined();
  });

  it("returns undefined when getToken throws (malformed token)", async () => {
    mockGetToken.mockRejectedValue(new Error("JWT verification failed"));
    const headers = new Headers({ cookie: "next-auth.session-token=garbage" });
    const result = await userFromRequest(headers);
    expect(result).toBeUndefined();
  });

  it("returns undefined for null/unknown headers input", async () => {
    const result = await userFromRequest(null);
    expect(result).toBeUndefined();

    const result2 = await userFromRequest(undefined);
    expect(result2).toBeUndefined();

    const result3 = await userFromRequest("not-headers");
    expect(result3).toBeUndefined();
  });

  it("accepts a plain Record<string, string> as headers", async () => {
    mockGetToken.mockResolvedValue({ userId: "user-rec" });
    const result = await userFromRequest({ cookie: "next-auth.session-token=xyz" });
    expect(result).toEqual({ id: "user-rec" });
  });

  it("handles Record with array values (takes first element)", async () => {
    mockGetToken.mockResolvedValue({ userId: "user-arr" });
    const result = await userFromRequest({
      cookie: ["next-auth.session-token=abc; other=val"],
    });
    expect(result).toEqual({ id: "user-arr" });
  });

  it("skips undefined values in Record headers", async () => {
    mockGetToken.mockResolvedValue(null);
    const result = await userFromRequest({ cookie: undefined });
    expect(result).toBeUndefined();
  });

  it("returns undefined when token has neither userId nor sub", async () => {
    mockGetToken.mockResolvedValue({ email: "test@test.com" });
    const headers = new Headers({ cookie: "next-auth.session-token=abc" });
    const result = await userFromRequest(headers);
    expect(result).toBeUndefined();
  });

  it("handles headers without cookie gracefully", async () => {
    mockGetToken.mockResolvedValue(null);
    const headers = new Headers({ "content-type": "application/json" });
    const result = await userFromRequest(headers);
    expect(result).toBeUndefined();
  });
});
