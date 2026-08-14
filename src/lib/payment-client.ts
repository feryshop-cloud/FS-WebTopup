import { logger } from "@/lib/logger";

export interface PaymentResult {
  payment_id: string;
  order_id: string;
  provider: "mock" | "pakasir";
  status: "pending" | "paid" | "failed" | "expired";
  amount: number;
  currency: string;
  payment_code: string;
  payment_code_display?: string;
  qr_string?: string;
  total_payment?: number;
  fee?: number;
  payment_method?: string;
  payment_url?: string;
  expires_at: number;
  created_at: string;
}

export interface PaymentWebhookPayload {
  event: "payment.paid" | "payment.failed" | "payment.expired";
  event_id: string;
  payment_id: string;
  order_id: string;
  status: "pending" | "paid" | "failed" | "expired";
  amount: number;
  currency: string;
  payment_code: string;
  paid_at?: string;
  failure_reason?: string;
  timestamp: string;
}

export function getPaymentServiceBaseUrl(): string {
  const url = process.env.PAYMENT_SERVICE_URL || process.env.MOCK_PAYMENT_GATEWAY_URL || "";
  return url.replace(/\/+$/, "");
}

export function getPaymentWebhookSecret(): string {
  return (
    process.env.PAYMENT_WEBHOOK_SECRET ||
    process.env.MOCK_PAYMENT_WEBHOOK_SECRET ||
    "dev-sandbox-secret-change-me"
  );
}

function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
}

/**
 * Membuat payment intent di payment-service worker (terpisah network).
 * Return null jika gateway tidak dikonfigurasi (PAYMENT_SERVICE_URL kosong).
 */
export async function createPayment(opts: {
  orderId: string;
  amount: number;
  description?: string;
  customer?: { name?: string; whatsapp?: string; email?: string };
  expiresInSeconds?: number;
  returnUrl: string;
}): Promise<PaymentResult | null> {
  const base = getPaymentServiceBaseUrl();
  if (!base) return null;

  const callbackUrl = `${getSiteBaseUrl()}/api/webhooks/payment`;

  try {
    const res = await fetch(`${base}/v1/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: opts.orderId,
        amount: Math.floor(opts.amount),
        currency: "IDR",
        description: opts.description,
        customer: opts.customer,
        expires_in_seconds: opts.expiresInSeconds,
        callback_url: callbackUrl,
        return_url: opts.returnUrl,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.warn("payment create failed", {
        orderId: opts.orderId,
        status: res.status,
        body,
      });
      return null;
    }

    const json = (await res.json()) as { success: boolean; data: PaymentResult };
    if (!json?.success || !json.data) return null;

    return json.data;
  } catch (error) {
    logger.warn("payment create threw", { orderId: opts.orderId, error });
    return null;
  }
}

/**
 * Verifikasi signature HMAC-SHA256 webhook dari payment-service worker.
 * Header `x-payment-signature` (baru) atau `x-mock-signature` (kompat mundur).
 */
export async function verifyPaymentWebhookSignature(
  rawBody: string,
  signature: string | null | undefined,
): Promise<boolean> {
  if (!signature || !rawBody) return false;
  const secret = getPaymentWebhookSecret();

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));

  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const actual = signature.toLowerCase();
  if (expected.length !== actual.length) return false;

  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  }
  return diff === 0;
}
