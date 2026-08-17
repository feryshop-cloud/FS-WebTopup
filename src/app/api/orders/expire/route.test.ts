import { describe, expect, it, vi, beforeEach } from "vitest";

// --- Mock logger ---
const mockInfo = vi.fn();
const mockWarn = vi.fn();
const mockError = vi.fn();
vi.mock("@/lib/logger", () => ({
  logger: {
    info: (...args: unknown[]) => mockInfo(...args),
    warn: (...args: unknown[]) => mockWarn(...args),
    error: (...args: unknown[]) => mockError(...args),
  },
}));

// --- Mock next/cache revalidatePath ---
const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
}));

// --- Mock verifyPaymentWebhookSignature so tests control auth outcome ---
const mockVerify = vi.fn();
vi.mock("@/lib/payment-client", () => ({
  verifyPaymentWebhookSignature: (...args: unknown[]) => mockVerify(...args),
}));

// --- Mock db so we can assert the order status write.
// NOTE: vi.mock factories are hoisted, so any values they reference must be plain
// `vi.fn()` objects (not module-local `const`s) defined at the top level.
const updateChain = {
  set: vi.fn(function () {
    return updateChain;
  }),
  where: vi.fn(function () {
    return updateChain;
  }),
  returning: vi.fn(() => Promise.resolve([] as unknown[])),
};
const selectChain = {
  select: vi.fn(() => selectChain),
  from: vi.fn(() => selectChain),
  where: vi.fn(() => selectChain),
  limit: vi.fn(() => Promise.resolve([] as unknown[])),
};
vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn(() => updateChain),
    select: vi.fn(() => selectChain),
  },
  orders: { id: "id", orderId: "orderId", paymentStatus: "paymentStatus", gatewayResponse: "gatewayResponse" },
}));

import { POST } from "@/app/api/orders/expire/route";

function makeRequest(body: unknown, signature = "ok") {
  const headers = new Headers();
  if (signature) headers.set("x-payment-signature", signature);
  return new Request("http://localhost/api/orders/expire", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/orders/expire", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (selectChain.limit as ReturnType<typeof vi.fn>).mockResolvedValue([] as unknown[]);
    (updateChain.returning as ReturnType<typeof vi.fn>).mockResolvedValue([] as unknown[]);
  });

  it("rejects requests with an invalid signature (401)", async () => {
    mockVerify.mockResolvedValueOnce(false);
    const res = await POST(makeRequest({ order_id: "O1", payment_id: "P1" }, "bad"));
    expect(res.status).toBe(401);
    expect(mockWarn).toHaveBeenCalledWith("order expire invalid signature", expect.any(Object));
    expect(updateChain.set).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON (400)", async () => {
    mockVerify.mockResolvedValueOnce(true);
    const res = await POST(makeRequest("not-json"));
    expect(res.status).toBe(400);
    expect(selectChain.select).not.toHaveBeenCalled();
  });

  it("rejects missing required fields (400)", async () => {
    mockVerify.mockResolvedValueOnce(true);
    const res = await POST(makeRequest({ order_id: "O1" }));
    expect(res.status).toBe(400);
    expect(updateChain.set).not.toHaveBeenCalled();
  });

  it("returns 404 when the target order does not exist", async () => {
    mockVerify.mockResolvedValueOnce(true);
    (selectChain.limit as ReturnType<typeof vi.fn>).mockResolvedValueOnce([] as unknown[]);
    const res = await POST(makeRequest({ order_id: "O1", payment_id: "P1" }));
    expect(res.status).toBe(404);
    expect(mockWarn).toHaveBeenCalledWith("order expire target not found", expect.any(Object));
    expect(updateChain.set).not.toHaveBeenCalled();
  });

  it("marks the order expired and logs 'order expired by payment-service'", async () => {
    mockVerify.mockResolvedValueOnce(true);
    (selectChain.limit as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 1, orderId: "O1", paymentStatus: "pending", gatewayResponse: { provider: "mock" } },
    ]);
    (updateChain.returning as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ id: 1 }] as unknown[]);

    const res = await POST(makeRequest({ order_id: "O1", payment_id: "P1", event_id: "E1" }));

    expect(res.status).toBe(200);
    expect(updateChain.set).toHaveBeenCalledTimes(1);
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ paymentStatus: "expired" }),
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/invoices/O1");
    expect(mockInfo).toHaveBeenCalledWith("order expired by payment-service", expect.any(Object));
  });

  it("deduplicates when order is already in a terminal state (200, no write)", async () => {
    mockVerify.mockResolvedValueOnce(true);
    (selectChain.limit as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 1, orderId: "O1", paymentStatus: "expired", gatewayResponse: { provider: "mock" } },
    ]);
    // notInArray guard filters it out -> 0 rows updated
    (updateChain.returning as ReturnType<typeof vi.fn>).mockResolvedValueOnce([] as unknown[]);

    const res = await POST(makeRequest({ order_id: "O1", payment_id: "P1", event_id: "E1" }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.deduplicated).toBe(true);
    expect(mockInfo).toHaveBeenCalledWith("order expire deduplicated", expect.any(Object));
  });

  it("returns 500 and logs when the db update throws", async () => {
    mockVerify.mockResolvedValueOnce(true);
    (selectChain.limit as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: 1, orderId: "O1", paymentStatus: "pending", gatewayResponse: { provider: "mock" } },
    ]);
    (updateChain.returning as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("db down"));

    const res = await POST(
      new Request("http://localhost/api/orders/expire", {
        method: "POST",
        headers: { "x-payment-signature": "ok" },
        body: JSON.stringify({ order_id: "O1", payment_id: "P1" }),
      }),
    );

    expect(res.status).toBe(500);
    expect(mockError).toHaveBeenCalledWith("order expire failed", expect.any(Object));
  });
});
