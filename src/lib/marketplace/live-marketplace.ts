import {
  MARKETPLACE_CATEGORIES,
  MOCK_ACCOUNTS,
  type GameAccount,
  type GameCategory,
} from "@/lib/data/mock-marketplace";

type PublicStockRow = {
  id: string;
  title_reference: string | null;
  account_specs: string | null;
  asking_price: string | number | null;
  status: string | null;
  image_urls: string[] | null;
  screenshot_url: string | null;
  created_at: string | null;
  games: {
    name: string | null;
    slug: string | null;
    image_url: string | null;
  } | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop";

const CATEGORY_META: Record<
  string,
  Pick<GameCategory, "slug" | "subtitle" | "iconName" | "colorTheme" | "popularRanks">
> = {
  "Mobile Legends": {
    slug: "mlbb",
    subtitle: "Bang Bang Akun Sultan & Mythic",
    iconName: "mlbb",
    colorTheme: "from-tertiary/20 via-tertiary/10 to-transparent border-tertiary/30",
    popularRanks: ["Mythic Glory", "Mythic Immortal", "Legend", "Epic", "Sultan Collector"],
  },
  "Free Fire": {
    slug: "ff",
    subtitle: "Akun SG 2 Ungu & Evo Gun Max",
    iconName: "ff",
    colorTheme: "from-primary/20 via-primary/10 to-transparent border-primary/30",
    popularRanks: ["Heroic / Master", "Grandmaster", "Akun Vault Penuh", "SG 2 Ungu", "Evo Gun Max"],
  },
  Valorant: {
    slug: "valorant",
    subtitle: "Skin Kuronami, Reaver & Radiant Peak",
    iconName: "valorant",
    colorTheme: "from-rose-600/20 via-red-600/10 to-transparent border-rose-500/30",
    popularRanks: ["Radiant", "Immortal 3", "Ascendant", "Diamond", "Full Skin Bundle"],
  },
  eFootball: {
    slug: "efootball",
    subtitle: "Tim Impian Epic Big Time 104+ OVR",
    iconName: "efootball",
    colorTheme: "from-info/20 via-info/10 to-transparent border-info/30",
    popularRanks: ["Divisi 1", "Tim 104+ OVR", "Epic Big Time", "Showtime Full", "Legendary Squad"],
  },
  "PUBG Mobile": {
    slug: "pubgm",
    subtitle: "M416 Glacier Max Lv 7 & Conqueror",
    iconName: "pubgm",
    colorTheme: "from-amber-600/20 via-yellow-600/10 to-transparent border-amber-500/30",
    popularRanks: ["Conqueror", "Ace Dominator", "Crown", "M416 Glacier Lv 7", "Set Firaun Max"],
  },
};

function getSupabaseRestConfig() {
  const configuredUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    "";
  const restUrl = configuredUrl.startsWith("http") ? configuredUrl.replace(/\/+$/, "") : "";
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

  return { restUrl, publishableKey };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPrice(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function categoryMeta(categoryName: string) {
  return CATEGORY_META[categoryName] ?? {
    slug: slugify(categoryName),
    subtitle: "Akun game terverifikasi siap Rekber",
    iconName: "mlbb" as const,
    colorTheme: "from-primary/20 via-primary/10 to-transparent border-primary/30",
    popularRanks: ["Sultan", "Ready", "Verified", "Hot Deal"],
  };
}

function normalizeEmbeddedGame(game: PublicStockRow["games"]) {
  if (Array.isArray(game)) return game[0] ?? null;
  return game;
}

function parseSpecsText(value: string | null) {
  if (!value?.trim()) {
    return {
      rank: "Akun Ready",
      loginVia: "All Monsep",
      description: ["Detail akun akan diverifikasi oleh admin sebelum proses serah terima."],
    };
  }

  const specs = value.trim();
  const loginMatch = specs.match(/(?:login|bind)\s+([^.,\n]+)/i);
  const rankMatch = specs.match(/(?:rank|tier)\s+([^.,\n]+)/i);

  return {
    rank: rankMatch?.[1]?.trim() || "Akun Ready",
    loginVia: loginMatch?.[1]?.trim() || "All Monsep",
    description: specs
      .split(/[.\n]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

function mapInventoryToAccount(row: PublicStockRow): GameAccount {
  const game = normalizeEmbeddedGame(row.games);
  const categoryName = game?.name || "Akun Game";
  const gameSlug = game?.slug || categoryMeta(categoryName).slug;
  const meta = categoryMeta(categoryName);
  const price = toPrice(row.asking_price);
  const images = Array.isArray(row.image_urls) ? row.image_urls.filter(Boolean) : [];
  const screenshot = row.screenshot_url ? [row.screenshot_url] : [];
  const displayImages = [...images, ...screenshot, game?.image_url].filter(Boolean) as string[];
  const displayId = row.id.slice(0, 8);
  const title = row.title_reference?.trim() || `${categoryName} Account ${displayId}`;
  const parsedSpecs = parseSpecsText(row.account_specs);

  return {
    id: row.id,
    slug: slugify(`${displayId}-${title}`),
    gameSlug,
    gameName: categoryName,
    title,
    price,
    badge: "Verified Seller",
    seller: {
      name: "FeryStore Official",
      rating: 5,
      salesCount: 0,
      isVerified: true,
      responseTime: "< 5 Menit",
    },
    specs: {
      rank: parsedSpecs.rank,
      skinsCount: "Cek detail",
      loginVia: parsedSpecs.loginVia as GameAccount["specs"]["loginVia"],
      changeName: "Available",
      deliveryType: "Manual Check (< 5 Menit)",
    },
    description: [
      `Stok internal ${displayId} sedang tersedia untuk kategori ${categoryName}.`,
      ...parsedSpecs.description,
      "Transaksi diproses melalui Rekber resmi Feryshop.",
    ],
    images: displayImages.length > 0 ? displayImages : [FALLBACK_IMAGE],
    createdAt: formatDate(row.created_at),
    isFeatured: true,
  };
}

export async function getLiveMarketplaceAccounts(): Promise<GameAccount[]> {
  const { restUrl, publishableKey } = getSupabaseRestConfig();
  if (!restUrl || !publishableKey) return [];

  const params = new URLSearchParams({
    select: "id,title_reference,account_specs,asking_price,status,image_urls,screenshot_url,created_at,games(name,slug,image_url)",
    status: "eq.AVAILABLE",
    order: "created_at.desc",
  });

  try {
    const response = await fetch(`${restUrl}/rest/v1/inventory?${params.toString()}`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      next: { revalidate: 30 },
    });

    if (!response.ok) return [];

    const rows = (await response.json()) as PublicStockRow[];
    return rows.map(mapInventoryToAccount);
  } catch (error) {
    console.warn("Live marketplace inventory query unavailable:", error);
    return [];
  }
}

export async function getMarketplaceAccounts() {
  const liveAccounts = await getLiveMarketplaceAccounts();
  return liveAccounts.length > 0 ? liveAccounts : MOCK_ACCOUNTS;
}

export async function getMarketplaceCategories() {
  const accounts = await getMarketplaceAccounts();
  if (accounts === MOCK_ACCOUNTS) return MARKETPLACE_CATEGORIES;

  const grouped = new Map<string, { name: string; slug: string; count: number; firstImage: string }>();
  accounts.forEach((account) => {
    const existing = grouped.get(account.gameSlug);
    if (existing) {
      existing.count += 1;
      return;
    }
    grouped.set(account.gameSlug, {
      name: account.gameName,
      slug: account.gameSlug,
      count: 1,
      firstImage: account.images[0] || FALLBACK_IMAGE,
    });
  });

  return Array.from(grouped.values()).map((item, index): GameCategory => {
    const meta = categoryMeta(item.name);
    return {
      id: String(index + 1),
      slug: item.slug,
      name: item.name,
      subtitle: meta.subtitle,
      iconName: meta.iconName,
      bannerUrl: item.firstImage,
      totalAccounts: item.count,
      colorTheme: meta.colorTheme,
      popularRanks: meta.popularRanks,
    };
  });
}

export async function getMarketplaceAccount(accountId: string) {
  const accounts = await getMarketplaceAccounts();
  return accounts.find((account) => account.id === accountId || account.slug === accountId) || null;
}
