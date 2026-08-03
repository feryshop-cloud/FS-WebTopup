import { hasDatabaseConnection, sqlClient } from "@/lib/db";

const FALLBACK_GAME_IMAGE = "/placeholder.png";
const FALLBACK_GAME_LOGO = "/logo-topup.webp";

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
  selling_price: number;
  selling_price_gold?: number;
  selling_price_platinum?: number;
  cost_price?: number;
  sku?: string | null;
  is_active: boolean;
  is_gangguan?: boolean;
  logo?: string | null;
  images?: string | null;
  brand?: string | null;
}

export interface RemoteSetting {
  key: string;
  value: unknown;
}

let liveGamesPromise: Promise<PublicGame[]> | undefined;
let liveProductsPromise: Promise<PublicProduct[]> | undefined;
let settingsTablePromise: Promise<boolean> | undefined;

export function shouldQueryLegacyStorefrontSchema() {
  return process.env.FS_PUBLIC_LEGACY_SCHEMA_SOURCE === "db";
}

function getSupabaseRestUrl() {
  const configuredUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");

  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  const projectRef = connectionString?.match(/@(?:db\.)?([a-z0-9]+)\.supabase\.co/i)?.[1];
  return projectRef ? `https://${projectRef}.supabase.co` : "";
}

function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
}

async function getLivePublicGamesFromRest(): Promise<PublicGame[]> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) return [];

  try {
    const response = await fetch(
      `${restUrl}/rest/v1/games?select=id,name,title,slug,image_url,banner,logo,developers,category_id,description,instructions,is_popular,is_active,sort_order&is_active=eq.true&order=sort_order.asc&order=name.asc`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return [];

    const rows = await response.json() as {
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

    return mapLiveGames(rows);
  } catch (error) {
    console.warn("Live Supabase REST games query unavailable:", error);
    return [];
  }
}

export async function getRemoteSettingsFromRest(): Promise<Record<string, unknown>> {
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
        next: { revalidate: 30 },
      },
    );

    if (!response.ok) return {};

    const rows = await response.json() as RemoteSetting[];
    return rows.reduce<Record<string, unknown>>((settings, row) => {
      settings[row.key] = row.value;
      return settings;
    }, {});
  } catch (error) {
    console.warn("Remote settings query unavailable:", error);
    return {};
  }
}

function mapLiveGames(rows: {
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
}[]): PublicGame[] {
  return rows.map((game, index) => ({
    id: game.id,
    title: game.title || game.name || game.slug,
    slug: game.slug,
    image: game.image_url || FALLBACK_GAME_IMAGE,
    banner: game.banner || game.image_url || FALLBACK_GAME_IMAGE,
    logo: game.logo || FALLBACK_GAME_LOGO,
    developers: game.developers || "Game Developer",
    category_id: game.category_id ?? index + 1,
    description: game.description ?? null,
    instructions: game.instructions ?? null,
    is_popular: Boolean(game.is_popular),
  }));
}

export async function getLivePublicGames(): Promise<PublicGame[]> {
  liveGamesPromise ??= getLivePublicGamesFromRest().then(async (restGames) => {
    if (restGames.length > 0 || !hasDatabaseConnection || !shouldQueryLegacyStorefrontSchema()) {
      return restGames;
    }

    return sqlClient<{
    id: string;
    title: string;
    slug: string;
    image_url: string | null;
    banner: string | null;
    logo: string | null;
    developers: string | null;
    category_id: number | null;
    description: string | null;
    instructions: unknown;
    is_popular: boolean | null;
  }[]>`
    select
      id::text as id,
      coalesce(title, name) as title,
      slug,
      image_url,
      banner,
      logo,
      developers,
      category_id,
      description,
      instructions,
      is_popular
    from public.games
    where is_active = true
    order by sort_order asc, name asc
  `
    .then(mapLiveGames)
    .catch((error) => {
      console.warn("Live Supabase games query unavailable:", error);
      return [];
    });
  });

  return liveGamesPromise;
}

async function getLivePublicProductsFromRest(): Promise<PublicProduct[]> {
  const restUrl = getSupabaseRestUrl();
  const publishableKey = getSupabasePublishableKey();
  if (!restUrl || !publishableKey) return [];

  try {
    const response = await fetch(
      `${restUrl}/rest/v1/products?select=id,game_slug,title,selling_price,selling_price_gold,selling_price_platinum,cost_price,sku,is_active,is_gangguan,logo,images,brand&is_active=eq.true&order=title.asc`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return [];

    return await response.json() as PublicProduct[];
  } catch (error) {
    console.warn("Live Supabase REST products query unavailable:", error);
    return [];
  }
}

export async function getLivePublicProducts(): Promise<PublicProduct[]> {
  liveProductsPromise ??= getLivePublicProductsFromRest().then(async (restProducts) => {
    if (restProducts.length > 0 || !hasDatabaseConnection || !shouldQueryLegacyStorefrontSchema()) {
      return restProducts;
    }

    return sqlClient<PublicProduct[]>`
      select
        id::text as id,
        game_slug,
        title,
        selling_price,
        selling_price_gold,
        selling_price_platinum,
        cost_price,
        sku,
        is_active,
        is_gangguan,
        logo,
        images,
        brand
      from public.products
      where is_active = true
      order by title asc
    `
      .catch((error) => {
        console.warn("Live Supabase products query unavailable:", error);
        return [];
      });
  });

  return liveProductsPromise;
}

export async function hasCompatibleSettingsTable(): Promise<boolean> {
  if (!hasDatabaseConnection) return false;

  settingsTablePromise ??= sqlClient<{ has_table: boolean }[]>`
    select (
      exists (
        select 1
        from information_schema.tables
        where table_schema = 'public'
          and table_name = 'settings'
      )
      and (
        select count(*)
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'settings'
          and column_name in ('key', 'value')
      ) = 2
    ) as has_table
  `
    .then((rows) => Boolean(rows[0]?.has_table))
    .catch((error) => {
      console.warn("Settings table metadata check unavailable:", error);
      return false;
    });

  return settingsTablePromise;
}
