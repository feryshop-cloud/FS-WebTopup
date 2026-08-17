import { describe, expect, it, vi, beforeEach } from "vitest";

// Use vi.hoisted so mock fns are available inside hoisted vi.mock factories
const { mockSqlClient, mockDbSelect } = vi.hoisted(() => ({
  mockSqlClient: vi.fn(),
  mockDbSelect: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    select: () => mockDbSelect,
  },
  products: {
    id: "id",
    sellingPrice: "selling_price",
    promoPrice: "promo_price",
  },
  sqlClient: mockSqlClient,
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val })),
}));

import { computeDiscount, callValidatePromo, getProductUnitPrice } from "@/lib/promo";

describe("computeDiscount", () => {
  it("calculates percentage discount", () => {
    const result = computeDiscount(100_000, {
      discountType: "percent",
      discountValue: 10,
      maxDiscount: 0,
    });
    expect(result).toBe(10_000);
  });

  it("caps percentage discount at maxDiscount", () => {
    const result = computeDiscount(1_000_000, {
      discountType: "percent",
      discountValue: 50,
      maxDiscount: 25_000,
    });
    // 50% of 1M = 500K, but capped at 25K
    expect(result).toBe(25_000);
  });

  it("does not cap when maxDiscount is 0 (no cap set)", () => {
    const result = computeDiscount(100_000, {
      discountType: "percent",
      discountValue: 20,
      maxDiscount: 0,
    });
    expect(result).toBe(20_000);
  });

  it("calculates fixed discount", () => {
    const result = computeDiscount(100_000, {
      discountType: "fixed",
      discountValue: 15_000,
      maxDiscount: 0,
    });
    expect(result).toBe(15_000);
  });

  it("clamps fixed discount to subtotal when discount exceeds subtotal", () => {
    const result = computeDiscount(5_000, {
      discountType: "fixed",
      discountValue: 50_000,
      maxDiscount: 0,
    });
    expect(result).toBe(5_000);
  });

  it("returns 0 for negative discount values", () => {
    const result = computeDiscount(100_000, {
      discountType: "fixed",
      discountValue: -500,
      maxDiscount: 0,
    });
    expect(result).toBe(0);
  });

  it("returns 0 when subtotal is 0", () => {
    const result = computeDiscount(0, {
      discountType: "percent",
      discountValue: 10,
      maxDiscount: 0,
    });
    expect(result).toBe(0);
  });

  it("floors percentage discount to integer", () => {
    const result = computeDiscount(33_333, {
      discountType: "percent",
      discountValue: 7,
      maxDiscount: 0,
    });
    // 33333 * 7 / 100 = 2333.31, floored to 2333
    expect(result).toBe(2333);
  });
});

describe("callValidatePromo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ok:false when RPC returns not_found", async () => {
    mockSqlClient.mockResolvedValue([{ r: { ok: false, err: "not_found" } }]);
    const result = await callValidatePromo("INVALID", 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.err).toBe("not_found");
      expect(result.message).toBe("Kode promo tidak valid");
    }
  });

  it("returns ok:true with normalized fields on success", async () => {
    mockSqlClient.mockResolvedValue([
      {
        r: {
          ok: true,
          code: "HEMAT10",
          discount: 10,
          discount_type: "percent",
          discount_value: 10,
          min_order: 50_000,
          max_discount: 25_000,
        },
      },
    ]);
    const result = await callValidatePromo("HEMAT10", 100_000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.code).toBe("HEMAT10");
      expect(result.discount).toBe(10);
      expect(result.discountType).toBe("percent");
      expect(result.discountValue).toBe(10);
      expect(result.minOrder).toBe(50_000);
      expect(result.maxDiscount).toBe(25_000);
    }
  });

  it("returns ok:false when RPC returns null/undefined", async () => {
    mockSqlClient.mockResolvedValue([{ r: null }]);
    const result = await callValidatePromo("MISSING", 10_000);
    expect(result.ok).toBe(false);
  });

  it("maps inactive error message", async () => {
    mockSqlClient.mockResolvedValue([{ r: { ok: false, err: "inactive" } }]);
    const result = await callValidatePromo("OLD_CODE", 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("OLD_CODE");
      expect(result.message).toContain("tidak aktif");
    }
  });

  it("maps expired error message", async () => {
    mockSqlClient.mockResolvedValue([{ r: { ok: false, err: "expired" } }]);
    const result = await callValidatePromo("EXPIRED1", 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("kadaluarsa");
    }
  });

  it("maps min_order error message", async () => {
    mockSqlClient.mockResolvedValue([{ r: { ok: false, err: "min_order" } }]);
    const result = await callValidatePromo("BIGDEAL", 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("Minimal transaksi");
    }
  });

  it("maps quota error message", async () => {
    mockSqlClient.mockResolvedValue([{ r: { ok: false, err: "quota" } }]);
    const result = await callValidatePromo("LIMITED", 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("habis");
    }
  });

  it("maps unknown error to default message", async () => {
    mockSqlClient.mockResolvedValue([{ r: { ok: false, err: "something_else" } }]);
    const result = await callValidatePromo("WEIRD", 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Kode promo tidak dapat digunakan");
    }
  });

  it("floors discount to non-negative integer", async () => {
    mockSqlClient.mockResolvedValue([
      {
        r: {
          ok: true,
          code: "TEST",
          discount: 10.7,
          discount_type: "percent",
          discount_value: 10.7,
          min_order: 0,
          max_discount: 0,
        },
      },
    ]);
    const result = await callValidatePromo("TEST", 100_000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.discount).toBe(10);
    }
  });
});

describe("getProductUnitPrice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns promoPrice when > 0", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [{ sellingPrice: 50_000, promoPrice: 35_000 }],
        }),
      }),
    } as any);

    const result = await getProductUnitPrice("some-uuid");
    expect(result).toBe(35_000);
  });

  it("falls back to sellingPrice when promoPrice is 0", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [{ sellingPrice: 50_000, promoPrice: 0 }],
        }),
      }),
    } as any);

    const result = await getProductUnitPrice("some-uuid");
    expect(result).toBe(50_000);
  });

  it("returns null when product not found", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    } as any);

    const result = await getProductUnitPrice("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null on DB error", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => {
            throw new Error("DB connection failed");
          },
        }),
      }),
    } as any);

    const result = await getProductUnitPrice("some-uuid");
    expect(result).toBeNull();
  });

  it("falls back to sellingPrice when promoPrice is null", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [{ sellingPrice: 75_000, promoPrice: null }],
        }),
      }),
    } as any);

    const result = await getProductUnitPrice("some-uuid");
    expect(result).toBe(75_000);
  });

  it("floors the returned price to integer", async () => {
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [{ sellingPrice: 50_000.75, promoPrice: 0 }],
        }),
      }),
    } as any);

    const result = await getProductUnitPrice("some-uuid");
    expect(result).toBe(50_000);
  });
});
