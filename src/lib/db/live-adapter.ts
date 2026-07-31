import { hasDatabaseConnection, sqlClient } from "@/lib/db";

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

let liveGamesPromise: Promise<PublicGame[]> | undefined;
let settingsTablePromise: Promise<boolean> | undefined;

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
      `${restUrl}/rest/v1/games?select=id,name,slug,image_url&order=name.asc`,
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
      slug: string;
      image_url: string | null;
    }[];

    return mapLiveGames(rows.map((row) => ({
      id: row.id,
      title: row.name,
      slug: row.slug,
      image: row.image_url,
    })));
  } catch (error) {
    console.warn("Live Supabase REST games query unavailable:", error);
    return [];
  }
}

function mapLiveGames(rows: { id: string; title: string; slug: string; image: string | null }[]): PublicGame[] {
  return rows.map((game, index) => ({
    id: game.id,
    title: game.title,
    slug: game.slug,
    image: game.image || "/banner-mobile-legend.png",
    banner: game.image || "/banner-mobile-legend.png",
    logo: game.image || null,
    developers: "Game Developer",
    category_id: index + 1,
    description: null,
    instructions: null,
    is_popular: index < 4,
  }));
}

export async function getLivePublicGames(): Promise<PublicGame[]> {
  liveGamesPromise ??= getLivePublicGamesFromRest().then(async (restGames) => {
    if (restGames.length > 0 || !hasDatabaseConnection) return restGames;

    return sqlClient<{
    id: string;
    title: string;
    slug: string;
    image: string | null;
  }[]>`
    select
      id::text as id,
      name as title,
      slug,
      image_url as image
    from public.games
    order by name asc
  `
    .then(mapLiveGames)
    .catch((error) => {
      console.warn("Live Supabase games query unavailable:", error);
      return [];
    });
  });

  return liveGamesPromise;
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
