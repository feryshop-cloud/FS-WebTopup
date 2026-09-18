import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

describe("verifyTurnstileToken", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.TURNSTILE_SECRET = "0x4AAAAAA_test_secret";
    process.env.TURNSTILE_HOSTNAMES = "localhost,127.0.0.1,feryshop.com";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("fails if TURNSTILE_SECRET is missing", async () => {
    delete process.env.TURNSTILE_SECRET;
    const res = await verifyTurnstileToken({
      token: "dummy-token",
      expectedAction: "signup",
    });
    expect(res.success).toBe(false);
    expect(res.reason).toContain("secret is not configured");
  });

  it("fails if token is empty or invalid type", async () => {
    const res1 = await verifyTurnstileToken({
      token: "",
      expectedAction: "signup",
    });
    expect(res1.success).toBe(false);
    expect(res1.reason).toBe("invalid-token");

    const res2 = await verifyTurnstileToken({
      token: null as any,
      expectedAction: "signup",
    });
    expect(res2.success).toBe(false);
    expect(res2.reason).toBe("invalid-token");
  });

  it("fails if token exceeds 2048 chars", async () => {
    const longToken = "a".repeat(2049);
    const res = await verifyTurnstileToken({
      token: longToken,
      expectedAction: "signup",
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe("invalid-token");
  });

  it("fails when Cloudflare siteverify returns success: false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const res = await verifyTurnstileToken({
      token: "some-token",
      expectedAction: "signup",
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe("verification-failed");
    expect(res.errorCodes).toContain("invalid-input-response");
  });

  it("fails if action does not match expectedAction", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          action: "login",
          hostname: "localhost",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const res = await verifyTurnstileToken({
      token: "valid-token",
      expectedAction: "signup",
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe("action-mismatch");
  });

  it("fails if hostname is not in allowed hostnames", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          action: "signup",
          hostname: "evil-phishing.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const res = await verifyTurnstileToken({
      token: "valid-token",
      expectedAction: "signup",
    });
    expect(res.success).toBe(false);
    expect(res.reason).toBe("hostname-mismatch");
  });

  it("succeeds when token, action, and hostname match", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          action: "signup",
          hostname: "feryshop.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const res = await verifyTurnstileToken({
      token: "valid-token",
      expectedAction: "signup",
      clientIp: "1.2.3.4",
    });
    expect(res.success).toBe(true);
    expect(res.action).toBe("signup");
    expect(res.hostname).toBe("feryshop.com");
  });
});
