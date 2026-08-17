import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock DB and logger
const mockDbSelect = vi.fn();
const mockDbCount = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => mockDbSelect,
    $count: (...args: unknown[]) => mockDbCount(...args),
  },
  reviews: {
    isPublished: "is_published",
    createdAt: "created_at",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ eq: true, col, val })),
  desc: vi.fn((col) => ({ desc: true, col })),
}));

const mockLoggerWarn = vi.fn();
vi.mock("@/lib/logger", () => ({
  logger: {
    warn: (...args: unknown[]) => mockLoggerWarn(...args),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import {
  isReviewsDatabaseEnabled,
  hasReviewsDatabaseEnabled,
  getReviewsPayload,
  REVIEWS_FEATURE_FLAG,
} from "@/lib/data/reviews";

describe("isReviewsDatabaseEnabled", () => {
  beforeEach(() => {
    delete process.env[REVIEWS_FEATURE_FLAG];
  });

  afterEach(() => {
    delete process.env[REVIEWS_FEATURE_FLAG];
  });

  it("returns true when feature flag env is 'true'", () => {
    process.env[REVIEWS_FEATURE_FLAG] = "true";
    expect(isReviewsDatabaseEnabled()).toBe(true);
  });

  it("returns false when feature flag is not set", () => {
    expect(isReviewsDatabaseEnabled()).toBe(false);
  });

  it("returns false when feature flag is 'false'", () => {
    process.env[REVIEWS_FEATURE_FLAG] = "false";
    expect(isReviewsDatabaseEnabled()).toBe(false);
  });

  it("returns false for any other value", () => {
    process.env[REVIEWS_FEATURE_FLAG] = "yes";
    expect(isReviewsDatabaseEnabled()).toBe(false);
  });
});

describe("hasReviewsDatabaseEnabled", () => {
  const origDbUrl = process.env.DATABASE_URL;
  const origSupaUrl = process.env.SUPABASE_DB_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_DB_URL;
    delete process.env[REVIEWS_FEATURE_FLAG];
  });

  afterEach(() => {
    if (origDbUrl) process.env.DATABASE_URL = origDbUrl;
    if (origSupaUrl) process.env.SUPABASE_DB_URL = origSupaUrl;
    delete process.env[REVIEWS_FEATURE_FLAG];
  });

  it("returns false when no DB credentials are configured", () => {
    process.env[REVIEWS_FEATURE_FLAG] = "true";
    expect(hasReviewsDatabaseEnabled()).toBe(false);
  });

  it("returns true when flag is on and DATABASE_URL is set", () => {
    process.env[REVIEWS_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";
    expect(hasReviewsDatabaseEnabled()).toBe(true);
  });

  it("returns true when flag is on and SUPABASE_DB_URL is set", () => {
    process.env[REVIEWS_FEATURE_FLAG] = "true";
    process.env.SUPABASE_DB_URL = "postgres://supabase/test";
    expect(hasReviewsDatabaseEnabled()).toBe(true);
  });

  it("returns false when DB credentials exist but flag is off", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    expect(hasReviewsDatabaseEnabled()).toBe(false);
  });
});

describe("getReviewsPayload", () => {
  const origDbUrl = process.env.DATABASE_URL;
  const origSupaUrl = process.env.SUPABASE_DB_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_DB_URL;
    delete process.env[REVIEWS_FEATURE_FLAG];
  });

  afterEach(() => {
    if (origDbUrl) process.env.DATABASE_URL = origDbUrl;
    if (origSupaUrl) process.env.SUPABASE_DB_URL = origSupaUrl;
    delete process.env[REVIEWS_FEATURE_FLAG];
  });

  it("returns seed data when DB is not enabled", async () => {
    const payload = await getReviewsPayload(1, 12);
    expect(payload.success).toBe(true);
    expect(payload.data.length).toBeGreaterThan(0);
    expect(payload.meta.current_page).toBe(1);
    expect(payload.meta.total).toBeGreaterThan(0);
    // Seed data uses per-item reviewer_display names (e.g. "Budi S.")
    expect(payload.data[0].reviewer_display).toBe("Budi S.");
  });

  it("paginates seed data correctly", async () => {
    const payload = await getReviewsPayload(1, 2);
    expect(payload.data.length).toBeLessThanOrEqual(2);
    expect(payload.meta.per_page).toBe(2);
    expect(payload.meta.current_page).toBe(1);
  });

  it("returns empty data for out-of-range seed page", async () => {
    const payload = await getReviewsPayload(999, 12);
    expect(payload.data).toEqual([]);
    expect(payload.success).toBe(true);
  });

  it("computes last_page correctly for seed data", async () => {
    const payload = await getReviewsPayload(1, 2);
    const expectedLastPage = Math.max(1, Math.ceil(payload.meta.total / 2));
    expect(payload.meta.last_page).toBe(expectedLastPage);
  });

  it("uses DB when enabled and returns DB data", async () => {
    process.env[REVIEWS_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";

    const mockReview = {
      id: 100,
      productTitle: "MLBB Diamonds",
      gameSlug: "mobile-legends",
      rating: 5,
      comment: "Bagus sekali!",
      isPublished: true,
      createdAt: new Date("2026-06-01T12:00:00Z"),
      orderId: "ord-1",
      userId: "user-1",
    };

    // Setup the select chain mock
    const chain: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockResolvedValue([mockReview]),
    };
    vi.mocked(mockDbSelect).mockReturnValue(chain as any);
    mockDbCount.mockResolvedValue(1);

    // We need to mock db.select() and db.$count properly
    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              offset: async () => [mockReview],
            }),
          }),
        }),
      }),
    } as any);
    vi.spyOn(db, "$count").mockResolvedValue(1);

    const payload = await getReviewsPayload(1, 12);
    expect(payload.success).toBe(true);
    expect(payload.data.length).toBe(1);
    expect(payload.data[0].id).toBe(100);
    expect(payload.data[0].product).toBe("MLBB Diamonds");
    expect(payload.data[0].game).toBe("mobile-legends");
    expect(payload.data[0].reviewer_display).toBe("Pelanggan Setia");
    expect(payload.meta.total).toBe(1);
  });

  it("falls back to seed when DB query throws", async () => {
    process.env[REVIEWS_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";

    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              offset: async () => {
                throw new Error("DB connection failed");
              },
            }),
          }),
        }),
      }),
    } as any);

    const payload = await getReviewsPayload(1, 12);
    expect(payload.success).toBe(true);
    // Should have fallen back to seed data
    expect(payload.data.length).toBeGreaterThan(0);
    expect(mockLoggerWarn).toHaveBeenCalled();
  });
});
