import { db, settings } from "@/lib/db";
import { seedSettings } from "@/lib/db/seed-data";

export interface SettingsPayload {
  success: boolean;
  data: Record<string, any>;
}

export async function getSiteSettings(): Promise<SettingsPayload> {
  try {
    const siteSettings: Record<string, any> = { ...seedSettings };

    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
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
