import { db, settings } from "@/lib/db";
import { hasCompatibleSettingsTable } from "@/lib/db/live-adapter";
import { seedSettings } from "@/lib/db/seed-data";

export interface SettingsPayload {
  success: boolean;
  data: Record<string, any>;
}

export async function getSiteSettings(): Promise<SettingsPayload> {
  try {
    const siteSettings: Record<string, any> = { ...seedSettings };

    if (process.env.FS_PUBLIC_SETTINGS_SOURCE === "db" && await hasCompatibleSettingsTable()) {
      try {
        const dbSettings = await db.select().from(settings);
        if (dbSettings && dbSettings.length > 0) {
          dbSettings.forEach((item) => {
            siteSettings[item.key] = item.value;
          });
        }
      } catch (e) {
        console.warn("Fallback getSiteSettings DB query:", e);
      }
    }

    // Enforce Feryshop branding and dark theme across all settings
    siteSettings["general.title"] = "Feryshop";
    siteSettings["site_name"] = "Feryshop";
    siteSettings["seo.title"] = "Feryshop - Marketplace Akun Game Sultan & Top Up";
    siteSettings["seo.description"] = "Platform Marketplace Akun Game Sultan & Layanan Top Up Game Resmi Termurah & Terpercaya 24 Jam.";
    siteSettings["footer.credit_text"] = "Made in Feryshop";
    siteSettings["general.logo"] = "/logo-2.png";
    siteSettings["theme.default_mode"] = "dark";
    siteSettings["theme.allow_toggle"] = true;

    return {
      success: true,
      data: siteSettings,
    };
  } catch (err) {
    return {
      success: true,
      data: seedSettings,
    };
  }
}
