/**
 * @file api-settings.ts
 * @description Utility for fetching site settings from API with fallback to Next.js environment variables.
 */

import { apiPath } from "@/lib/routes";

/**
 * Fetches site configuration from the API `/api/settings` endpoint.
 *
 * If a `NEXT_PUBLIC_SITE_URL` is present in the environment, it is used as the base URL
 * for the API request; otherwise, the request is made to the relative path.
 *
 * @returns A Promise that resolves to the site settings data object.
 * @throws Will throw an Error if the API request fails or returns a non-2xx status code.
 *
 * @example
 * ```typescript
 * import { getSettings } from "@/lib/api-settings";
 *
 * const settings = await getSettings();
 * console.log(settings.site_name); // Access site settings
 * ```
 */
export async function getSettings() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const url = siteUrl ? `${siteUrl}${apiPath("/api/settings")}` : apiPath("/api/settings");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Gagal mengambil data settings");

  const json = await res.json();
  return json?.data;
}
