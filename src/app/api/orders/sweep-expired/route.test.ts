import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

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

// --- Mock db ---
const updateChain = {
  set: vi.fn(function () {
    return updateChain;
  }),
  where: vi.fn(function () {
    return updateChain;
  }),
  returning: vi.fn(() => Promise.resolve([] as unknown[])),
};
vi.mock("@/lib/db", () => ({
  db: {
    update: vi.fn(() => updateChain),
  },
  orders: {
    id: "id",
    orderId: "orderId",
    paymentStatus: "paymentStatus",
    expiredTime: "expiredTime",
  },
}));

import { POST, GET } from "@/app/api/orders/sweep-expired/route";

function makeRequest(url = "http://localhost/api/orders/sweep-expired", headersObj: Record<string, string> = {}) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(headersObj)) {
    headers.set(k, v);
  }
  return new Request(url, {
    method: "POST",
    headers,
  });
}

describe("POST /api/orders/sweep-expired", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    (updateChain.returning as ReturnType<typeof vi.fn>).mockResolvedValue([] as unknown[]);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("rejects unauthorized requests in production when CRON_SECRET is set", async () => {
    (process.env as any).NODE_ENV = "production";
    process.env.CRON_SECRET = "supersecret123";

    const req = makeRequest();
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(mockWarn).toHaveBeenCalledWith("sweep-expired unauthorized attempt", expect.any(Object));
  });

  it("authorizes with Bearer token header", async () => {
    (process.env as any).NODE_ENV = "production";
    process.env.CRON_SECRET = "supersecret123";

    (updateChain.returning as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "1", orderId: "TSON-1001" },
      { id: "2", orderId: "TSON-1002" },
    ]);

    const req = makeRequest("http://localhost/api/orders/sweep-expired", {
      authorization: "Bearer supersecret123",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.sweptCount).toBe(2);
    expect(json.sweptOrderIds).toEqual(["TSON-1001", "TSON-1002"]);
  });

  it("authorizes with query token param", async () => {
    (process.env as any).NODE_ENV = "production";
    process.env.CRON_SECRET = "supersecret123";

    (updateChain.returning as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    const req = makeRequest("http://localhost/api/orders/sweep-expired?token=supersecret123");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.sweptCount).toBe(0);
  });
});
