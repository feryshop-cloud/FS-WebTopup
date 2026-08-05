import { logger } from "@/lib/logger";

const FALLBACK_GAME_IMAGE = "/placeholder.png";
const FALLBACK_GAME_LOGO = "/logo-topup.webp";

/**
 * Converts a DB-stored path (e.g. "/games/logo/mlbb-icon.webp") to a URL
 * routed through the internal /api/proxy-image route, which adds S3 auth.
 * Full http(s) URLs are returned as-is (external CDN, Unsplash, etc.).
 * If path is empty/null, returns null.
 */
function resolveStorageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/api/proxy-image?path=${encodeURIComponent(cleanPath)}`;
}

export interface PublicGame {
  id: string;
  title: string;
  slug: string;
  image: string;
  banner: string | null;
  logo: string | null;
  developers: string;
  category_id: number;
  description: string | null;
  instructions: unknown;
  is_popular: boolean;
}

export interface PublicProduct {
  id: string;
  game_slug: string;
  title: string;
  selling_price: number | string;
  selling_price_gold?: number | string | null;
  selling_price_platinum?: number | string | null;
  promo_price?: number | string | null;
  cost_price?: number | string | null;
  sku?: string | null;
  is_active?: boolean | null;
  is_gangguan?: boolean | null;
  logo?: string | null;
  images?: string | null;
  brand?: string | null;
}

export interface PublicCategory {
  id: number;
  title: string;
  logo?: string | null;
  game_slug?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

export interface PublicPaymentMethod {
  id: string;
  name: string;
  images?: string | null;
  payment_id?: string | null;
  minimum_amount?: number | string | null;
  maximum_amount?: number | string | null;
  fee?: number | string | null;
  fee_percent?: number | string | null;
  type?: string | null;
  status?: string | null;
  group?: string | null;
  is_outside_group?: boolean | null;
  badge_text?: string | null;
  outside_sort?: number | null;
  instructions?: unknown;
  sort_order?: number | null;
}

export interface RemoteSetting {
  key: string;
  value: unknown;
}

function getSupabaseRestUrl() {
  const configuredUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");

  const connectionString =
    process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!connectionString) return "";

  // Match standard host: db.{ref}.supabase.co
  const refFromHost = connectionString.match(
    /@(?:db\.)?([a-z0-9]+)\.supabase\.co/i,
  )?.[1];
  if (refFromHost) return `https://${refFromHost}.supabase.co`;

  // Match Supabase pooler host: *.pooler.supabase.com - project ref is embedded in the username (postgres.{ref})
  const refFromUser = connectionString.match(
    /\/\/(?:[^:]+\.)?([a-z0-9]+):[^@]+@[^/]*\.pooler\.supabase\.com/i,
  )?.[1];
  if (refFromUser) return `https://${refFromUser}.supabase.co`;

  return "";
}

function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

export async function getLivePublicGames(): Promise<PublicGame[]> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) {
    logger.warn("getLivePublicGames missing credentials", {
      restUrl,
      hasKey: Boolean(publishableKey),
    });
    return [];
  }

  try {
    const url = `${restUrl}/rest/v1/games?select=id,name,title,slug,image_url,banner,logo,developers,category_id,description,instructions,is_popular,is_active,sort_order&is_active=eq.true&order=sort_order.asc&order=name.asc`;
    const response = await fetch(url, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errText = await response.text();
      logger.error("getLivePublicGames http error", {
        status: response.status,
        body: errText,
      });
      return [];
    }

    const rows = (await response.json()) as {
      id: string;
      name: string;
      title: string | null;
      slug: string;
      image_url: string | null;
      banner: string | null;
      logo: string | null;
      developers: string | null;
      category_id: number | null;
      description: string | null;
      instructions: unknown;
      is_popular: boolean | null;
    }[];

    logger.info("getLivePublicGames success", { count: rows.length });
    return mapLiveGames(rows);
  } catch (error) {
    logger.error("getLivePublicGames failed", { error });
    return [];
  }
}

export async function getRemoteSettingsFromRest(): Promise<
  Record<string, unknown>
> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) return {};

  try {
    const response = await fetch(
      `${restUrl}/rest/v1/settings?select=key,value&order=key.asc`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) return {};

    const rows = (await response.json()) as RemoteSetting[];
    return rows.reduce<Record<string, unknown>>((settings, row) => {
      settings[row.key] = row.value;
      return settings;
    }, {});
  } catch (error) {
    logger.warn("getRemoteSettingsFromRest unavailable", { error });
    return {};
  }
}

function mapLiveGames(
  rows: {
    id: string;
    name?: string | null;
    title?: string | null;
    slug: string;
    image_url?: string | null;
    banner?: string | null;
    logo?: string | null;
    developers?: string | null;
    category_id?: number | null;
    description?: string | null;
    instructions?: unknown;
    is_popular?: boolean | null;
  }[],
): PublicGame[] {
  return rows.map((game, index) => {
    const imageUrl = resolveStorageUrl(game.image_url);
    const bannerUrl = resolveStorageUrl(game.banner);
    const logoUrl = resolveStorageUrl(game.logo);

    return {
      id: game.id,
      title: game.title || game.name || game.slug,
      slug: game.slug,
      image: imageUrl || FALLBACK_GAME_IMAGE,
      banner: bannerUrl || imageUrl || FALLBACK_GAME_IMAGE,
      logo: logoUrl || FALLBACK_GAME_LOGO,
      developers: game.developers || "Game Developer",
      category_id: game.category_id ?? index + 1,
      description: game.description ?? null,
      instructions: game.instructions ?? null,
      is_popular: Boolean(game.is_popular),
    };
  });
}

export async function getLivePublicProducts(): Promise<PublicProduct[]> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) {
    logger.warn("getLivePublicProducts missing credentials", {
      restUrl,
      hasKey: Boolean(publishableKey),
    });
    return [];
  }

  try {
    const response = await fetch(
      `${restUrl}/rest/v1/products?select=id,game_slug,title,selling_price,selling_price_gold,selling_price_platinum,promo_price,cost_price,sku,is_active,is_gangguan,logo,images&is_active=eq.true&order=title.asc`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.error("getLivePublicProducts http error", {
        status: response.status,
        body: errText,
      });
      return [];
    }

    const data = (await response.json()) as PublicProduct[];
    logger.info("getLivePublicProducts success", { count: data.length });
    return data;
  } catch (error) {
    logger.error("getLivePublicProducts failed", { error });
    return [];
  }
}

export async function getLivePublicCategories(): Promise<PublicCategory[]> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) {
    logger.warn("getLivePublicCategories missing credentials", {
      restUrl,
      hasKey: Boolean(publishableKey),
    });
    return [];
  }

  try {
    const response = await fetch(
      `${restUrl}/rest/v1/categories?select=id,title,logo,game_slug,sort_order,is_active&is_active=eq.true&order=sort_order.asc`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.error("getLivePublicCategories http error", {
        status: response.status,
        body: errText,
      });
      return [];
    }
    const data = (await response.json()) as PublicCategory[];
    logger.info("getLivePublicCategories success", { count: data.length });
    return data;
  } catch (error) {
    logger.error("getLivePublicCategories failed", { error });
    return [];
  }
}

export async function getLivePublicPaymentMethods(): Promise<
  PublicPaymentMethod[]
> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) {
    logger.warn("getLivePublicPaymentMethods missing credentials", {
      restUrl,
      hasKey: Boolean(publishableKey),
    });
    return [];
  }

  try {
    const response = await fetch(
      `${restUrl}/rest/v1/payment_methods?select=id,name,images,payment_id,minimum_amount,maximum_amount,fee,fee_percent,type,status,group,is_outside_group,badge_text,outside_sort,instructions,sort_order&status=eq.ACTIVE&order=sort_order.asc`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      logger.error("getLivePublicPaymentMethods http error", {
        status: response.status,
        body: errText,
      });
      return [];
    }
    const data = (await response.json()) as PublicPaymentMethod[];
    logger.info("getLivePublicPaymentMethods success", { count: data.length });
    return data;
  } catch (error) {
    logger.error("getLivePublicPaymentMethods failed", { error });
    return [];
  }
}
