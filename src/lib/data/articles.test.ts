import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock DB
const mockDbSelect = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => mockDbSelect,
  },
  articles: {
    slug: "slug",
  },
  seedArticles: [],
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ eq: true, col, val })),
}));

vi.mock("@/lib/db/seed-data", () => ({
  seedArticles: [
    {
      id: 1,
      title: "Cara Top Up MLBB",
      slug: "cara-top-up-mlbb",
      image: "https://example.com/mlbb.jpg",
      thumbnail: "https://example.com/mlbb-thumb.jpg",
      excerpt: "Panduan top up MLBB",
      content: "<p>Konten artikel</p>",
      author: "Admin Feryshop",
      views: 1840,
      created_at: "2026-07-20T10:00:00Z",
      published_at: "2026-07-20T10:00:00Z",
      category: { id: 1, title: "Panduan", slug: "panduan" },
    },
    {
      id: 2,
      title: "Review Valorant",
      slug: "review-valorant",
      image: null,
      excerpt: null,
      content: "<p>Review game Valorant</p>",
      author: "Admin Feryshop",
      views: 500,
      created_at: "2026-07-21T10:00:00Z",
      published_at: "2026-07-21T10:00:00Z",
      category: { id: 2, title: "Review", slug: "review" },
    },
  ],
}));

import {
  isArticlesDatabaseEnabled,
  hasArticleDatabaseEnabled,
  getSeedArticles,
  getArticleBySlug,
  ARTICLE_FEATURE_FLAG,
} from "@/lib/data/articles";

describe("isArticlesDatabaseEnabled", () => {
  beforeEach(() => {
    delete process.env[ARTICLE_FEATURE_FLAG];
  });

  afterEach(() => {
    delete process.env[ARTICLE_FEATURE_FLAG];
  });

  it("returns true when feature flag is 'true'", () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    expect(isArticlesDatabaseEnabled()).toBe(true);
  });

  it("returns false when flag is not set", () => {
    expect(isArticlesDatabaseEnabled()).toBe(false);
  });

  it("returns false when flag is 'false'", () => {
    process.env[ARTICLE_FEATURE_FLAG] = "false";
    expect(isArticlesDatabaseEnabled()).toBe(false);
  });

  it("returns false for non-'true' values", () => {
    process.env[ARTICLE_FEATURE_FLAG] = "1";
    expect(isArticlesDatabaseEnabled()).toBe(false);
  });
});

describe("hasArticleDatabaseEnabled", () => {
  const origDbUrl = process.env.DATABASE_URL;
  const origSupaUrl = process.env.SUPABASE_DB_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_DB_URL;
    delete process.env[ARTICLE_FEATURE_FLAG];
  });

  afterEach(() => {
    if (origDbUrl) process.env.DATABASE_URL = origDbUrl;
    if (origSupaUrl) process.env.SUPABASE_DB_URL = origSupaUrl;
    delete process.env[ARTICLE_FEATURE_FLAG];
  });

  it("returns false when no DB credentials exist", () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    expect(hasArticleDatabaseEnabled()).toBe(false);
  });

  it("returns true when flag on and DATABASE_URL set", () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";
    expect(hasArticleDatabaseEnabled()).toBe(true);
  });

  it("returns true when flag on and SUPABASE_DB_URL set", () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    process.env.SUPABASE_DB_URL = "postgres://supabase/test";
    expect(hasArticleDatabaseEnabled()).toBe(true);
  });

  it("returns false when credentials exist but flag is off", () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    expect(hasArticleDatabaseEnabled()).toBe(false);
  });
});

describe("getSeedArticles", () => {
  it("returns all seed articles normalized as ArticleRecord[]", () => {
    const articles = getSeedArticles();
    expect(articles.length).toBe(2);
  });

  it("normalizes seed article fields correctly", () => {
    const articles = getSeedArticles();
    const first = articles[0];
    expect(first.id).toBe(1);
    expect(first.title).toBe("Cara Top Up MLBB");
    expect(first.slug).toBe("cara-top-up-mlbb");
    expect(first.content).toContain("Konten artikel");
    expect(first.author).toBe("Admin Feryshop");
    expect(first.views).toBe(1840);
    expect(first.category).toEqual({ id: 1, title: "Panduan", slug: "panduan" });
  });

  it("uses image field for both image and thumbnail", () => {
    const articles = getSeedArticles();
    const first = articles[0];
    expect(first.image).toBe("https://example.com/mlbb.jpg");
    // thumbnail from seed is the image field
    expect(first.thumbnail).toBe("https://example.com/mlbb.jpg");
  });

  it("handles null image gracefully", () => {
    const articles = getSeedArticles();
    const second = articles[1];
    expect(second.image).toBeNull();
    expect(second.thumbnail).toBeNull();
  });
});

describe("getArticleBySlug", () => {
  const origDbUrl = process.env.DATABASE_URL;
  const origSupaUrl = process.env.SUPABASE_DB_URL;

  beforeEach(() => {
    delete process.env.DATABASE_URL;
    delete process.env.SUPABASE_DB_URL;
    delete process.env[ARTICLE_FEATURE_FLAG];
  });

  afterEach(() => {
    if (origDbUrl) process.env.DATABASE_URL = origDbUrl;
    if (origSupaUrl) process.env.SUPABASE_DB_URL = origSupaUrl;
    delete process.env[ARTICLE_FEATURE_FLAG];
  });

  it("finds seed article by slug when DB is disabled", async () => {
    const article = await getArticleBySlug("cara-top-up-mlbb");
    expect(article).not.toBeNull();
    expect(article!.title).toBe("Cara Top Up MLBB");
    expect(article!.slug).toBe("cara-top-up-mlbb");
  });

  it("returns null for non-existent slug", async () => {
    const article = await getArticleBySlug("does-not-exist");
    expect(article).toBeNull();
  });

  it("queries DB when enabled and returns normalized article", async () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";

    const dbArticle = {
      id: 99,
      slug: "db-article",
      title: "DB Article",
      thumbnail: "https://example.com/thumb.jpg",
      content: "<p>DB content</p>",
      excerpt: "DB excerpt",
      author: "DB Author",
      views: 100,
      isPublished: true,
      createdAt: new Date("2026-08-01T12:00:00Z"),
      updatedAt: new Date("2026-08-01T12:00:00Z"),
    };

    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [dbArticle],
        }),
      }),
    } as any);

    const article = await getArticleBySlug("db-article");
    expect(article).not.toBeNull();
    expect(article!.id).toBe(99);
    expect(article!.title).toBe("DB Article");
    expect(article!.author).toBe("DB Author");
    // normalizeArticle sets category to a default
    expect(article!.category).toEqual({ id: 1, title: "Berita", slug: "berita" });
  });

  it("falls back to seed when DB returns no results", async () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";

    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    } as any);

    // Should fall back to seed data
    const article = await getArticleBySlug("cara-top-up-mlbb");
    expect(article).not.toBeNull();
    expect(article!.title).toBe("Cara Top Up MLBB");
  });

  it("falls back to seed when DB query throws", async () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";

    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => {
            throw new Error("DB error");
          },
        }),
      }),
    } as any);

    const article = await getArticleBySlug("cara-top-up-mlbb");
    expect(article).not.toBeNull();
    expect(article!.title).toBe("Cara Top Up MLBB");
  });

  it("returns null when neither DB nor seed has the slug", async () => {
    process.env[ARTICLE_FEATURE_FLAG] = "true";
    process.env.DATABASE_URL = "postgres://localhost/test";

    const { db } = await import("@/lib/db");
    vi.spyOn(db, "select").mockReturnValue({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    } as any);

    const article = await getArticleBySlug("nonexistent-slug");
    expect(article).toBeNull();
  });
});
