import { describe, expect, it, vi, afterEach } from "vitest";
import {
  createPayment,
  getPaymentServiceBaseUrl,
  getPaymentWebhookSecret,
  verifyPaymentWebhookSignature,
} from "@/lib/payment-client";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("payment-client", () => {
  describe("getPaymentServiceBaseUrl", () => {
    it("menghilangkan trailing slash", () => {
      vi.stubEnv("PAYMENT_SERVICE_URL", "https://pay.example.com/");
      expect(getPaymentServiceBaseUrl()).toBe("https://pay.example.com");
    });

    it("fallback ke MOCK_PAYMENT_GATEWAY_URL", () => {
      vi.stubEnv("MOCK_PAYMENT_GATEWAY_URL", "https://mock.example.com");
      expect(getPaymentServiceBaseUrl()).toBe("https://mock.example.com");
    });

    it("kosong jika tidak ada env", () => {
      expect(getPaymentServiceBaseUrl()).toBe("");
    });
  });

  describe("getPaymentWebhookSecret", () => {
    it("pakai PAYMENT_WEBHOOK_SECRET", () => {
      vi.stubEnv("PAYMENT_WEBHOOK_SECRET", "secret-a");
      expect(getPaymentWebhookSecret()).toBe("secret-a");
    });

    it("fallback dev sandbox", () => {
      expect(getPaymentWebhookSecret()).toBe("dev-sandbox-secret-change-me");
    });
  });

  describe("createPayment", () => {
    it("return null tanpa gateway url", async () => {
      vi.stubEnv("PAYMENT_SERVICE_URL", "");
      const result = await createPayment({
        orderId: "TSON-1",
        amount: 50000,
        returnUrl: "https://site.test/invoices/TSON-1",
      });
      expect(result).toBeNull();
    });

    it("kirim body yang benar ke gateway", async () => {
      vi.stubEnv("PAYMENT_SERVICE_URL", "https://pay.example.com/");
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://site.test/");
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            payment_id: "pay_1",
            order_id: "TSON-1",
            provider: "mock",
            status: "pending",
            amount: 50000,
            currency: "IDR",
            payment_code: "QR-1",
            expires_at: 123,
            created_at: "2026-01-01",
          },
        }),
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await createPayment({
        orderId: "TSON-1",
        amount: 50000.9,
        returnUrl: "https://site.test/invoices/TSON-1",
      });

      expect(result).not.toBeNull();
      expect(result?.order_id).toBe("TSON-1");
      const [, init] = fetchMock.mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.amount).toBe(50000);
      expect(body.currency).toBe("IDR");
      expect(body.callback_url).toBe("https://site.test/api/webhooks/payment");
      expect(init.cache).toBe("no-store");
    });

    it("return null saat gateway error", async () => {
      vi.stubEnv("PAYMENT_SERVICE_URL", "https://pay.example.com");
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => "err" }),
      );
      const result = await createPayment({
        orderId: "TSON-2",
        amount: 10000,
        returnUrl: "https://site.test/invoices/TSON-2",
      });
      expect(result).toBeNull();
    });
  });

  describe("verifyPaymentWebhookSignature", () => {
    it("menerima signature yang valid", async () => {
      vi.stubEnv("PAYMENT_WEBHOOK_SECRET", "secret-a");
      const rawBody = JSON.stringify({ event: "payment.paid", order_id: "TSON-1" });
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode("secret-a"),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
      const signature = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      expect(await verifyPaymentWebhookSignature(rawBody, signature)).toBe(true);
    });

    it("menolak signature yang salah", async () => {
      vi.stubEnv("PAYMENT_WEBHOOK_SECRET", "secret-a");
      const rawBody = JSON.stringify({ event: "payment.paid" });
      expect(await verifyPaymentWebhookSignature(rawBody, "deadbeef")).toBe(false);
    });

    it("menolak tanpa signature", async () => {
      expect(await verifyPaymentWebhookSignature("{}", null)).toBe(false);
    });
  });
});
