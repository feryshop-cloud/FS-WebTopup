import { MARKETPLACE_CATEGORIES, MOCK_ACCOUNTS } from "@/lib/data/mock-marketplace";
import { seedArticles } from "@/lib/db/seed-data";

const ARTICLE_DB_FLAG = "FS_PUBLIC_ARTICLES_DB_ENABLED";

const CATEGORY_SLUGS = new Set(MARKETPLACE_CATEGORIES.map((category) => category.slug));

const MOCK_ACCOUNT_KEYS = new Set<string>();
for (const account of MOCK_ACCOUNTS) {
  MOCK_ACCOUNT_KEYS.add(account.id);
  MOCK_ACCOUNT_KEYS.add(account.slug);
}

function getRestConfig() {
  const base =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";
  const restUrl = base.startsWith("http") ? base.replace(/\/+$/, "") : "";
  return { restUrl, key };
}

async function fetchRows(table: string, params: string): Promise<Record<string, any>[] | null> {
  const { restUrl, key } = getRestConfig();
  if (!restUrl || !key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${restUrl}/rest/v1/${table}?${params}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as unknown;
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function artikelExists(slug: string): Promise<boolean> {
  if (seedArticles.some((article) => article.slug === slug)) return true;

  if (process.env[ARTICLE_DB_FLAG] !== "true") return false;

  const rows = await fetchRows(
    "articles",
    `slug=eq.${encodeURIComponent(slug)}&select=slug&limit=1`,
  );
  if (rows === null) return true;
  return rows.length > 0;
}

async function categoryExists(slug: string): Promise<boolean> {
  if (CATEGORY_SLUGS.has(slug)) return true;

  const rows = await fetchRows("games", "select=slug");
  if (rows === null) return true;
  return rows.some((game) => game.slug === slug);
}

async function accountExists(categorySlug: string, accountId: string): Promise<boolean> {
  if (MOCK_ACCOUNT_KEYS.has(accountId)) return true;

  const rows = await fetchRows("inventory", "select=id,games(slug)&status=eq.AVAILABLE&limit=1000");
  if (rows === null) return true;

  const prefix = accountId.slice(0, 8);
  const account = rows.find((row) => row.id === accountId || row.id.startsWith(prefix));
  if (!account) return false;

  const gameSlug = account.games?.slug as string | undefined;
  return gameSlug === undefined || gameSlug === categorySlug;
}

export async function shouldReturnNotFound(pathname: string): Promise<boolean> {
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length === 2 && parts[0] === "artikel") {
    return !(await artikelExists(parts[1]));
  }

  if (parts.length === 2 && parts[0] === "marketplace") {
    return !(await categoryExists(parts[1]));
  }

  if (parts.length === 3 && parts[0] === "marketplace") {
    return !(await accountExists(parts[1], parts[2]));
  }

  return false;
}
