import { db, settings } from "@/lib/db";
import { getRemoteSettingsFromRest } from "@/lib/db/live-adapter";
import { seedSettings } from "@/lib/db/seed-data";
import { logger } from "@/lib/logger";

export interface SettingsPayload {
  success: boolean;
  data: Record<string, any>;
}

export async function getSiteSettings(): Promise<SettingsPayload> {
  try {
    const siteSettings: Record<string, any> = { ...seedSettings };
    const remoteSettings = await getRemoteSettingsFromRest();

    Object.assign(siteSettings, remoteSettings);

    if (process.env.FS_PUBLIC_SETTINGS_SOURCE === "db") {
      try {
        const dbSettings = await db.select().from(settings);
        if (dbSettings && dbSettings.length > 0) {
          dbSettings.forEach((item) => {
            siteSettings[item.key] = item.value;
          });
        }
      } catch (e) {
        logger.warn("getSiteSettings DB fallback", { error: e });
      }
    }

    return {
      success: true,
      data: siteSettings,
    };
  } catch (err) {
    logger.warn("getSiteSettings fallback to seed", { error: err });
    return {
      success: true,
      data: seedSettings,
    };
  }
}
