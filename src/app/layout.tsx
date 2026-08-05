import "./globals.css";
import "./embla.css";
import "./custom.css";
import { GeistSans } from "geist/font/sans";
import { SettingsProvider, type SettingsPayload } from "@/context/settings-context";
import { getSiteSettings } from "@/lib/data/settings";
import PanelLayout from "@/components/panel/panel-layout";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SWRProvider } from "@/components/providers/swr-provider";
import { ProgressBarWrapper } from "@/components/progress-bar/progress-bar-wrapper";
import { Toaster } from "sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3100";

// --- Utility Helpers ---
const resolveSingle = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" && first.trim() ? first : undefined;
  }
  return typeof value === "string" && value.trim() ? value : undefined;
};

const safeString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
};

// --- Fetch Settings ---
async function fetchSettings(): Promise<SettingsPayload | null> {
  try {
    const payload = await getSiteSettings();
    return payload;
  } catch (error) {
    logger.error("layout fetch settings failed", { error });
    return null;
  }
}

// --- Sanitize RSC-safe settings ---
// Next.js RSC inlines serialized props as JavaScript literals in HTML.
// Strings containing line separators (U+2028/U+2029) or </script> will
// produce a SyntaxError in the browser. Escape them before passing to
// any client component.
function sanitizeForRSC(data: Record<string, any>): Record<string, any> {
  const safe: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      safe[key] = value
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029")
        .replace(/<\/script>/gi, "<\\/script>");
    } else {
      safe[key] = value;
    }
  }
  return safe;
}

// --- Metadata Generator ---
export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = new URL(siteUrl);
  const settings = await fetchSettings();
  const data = settings?.data ?? {};

  // SEO Basics
  const metaTitle = safeString(
    data["seo.title"] ||
      data["general.title"] ||
      "Feryshop | Pusat Jual Beli & Top Up Akun Game Sultan #1 Terpercaya",
  );
  const metaDescription = safeString(
    data["seo.description"] ||
      "Feryshop | Marketplace jual beli akun game Sultan (MLBB, Free Fire, Valorant, eFootball, PUBG Mobile) & layanan top up game murah, cepat, teraman dengan Rekber resmi 24/7 dan garansi anti-hack 100%.",
  );
  const metaKeywords = safeString(
    data["seo.keywords"] ||
      "feryshop, jual beli akun game, marketplace akun game sultan, top up game murah, rekber akun game terpercaya, akun mlbb sultan, beli akun free fire, top up mobile legends murah, feryshop rekber",
  );

  // OG & Twitter
  const ogTitle = safeString(data["seo.og_title"] || metaTitle);
  const ogDescription = safeString(data["seo.og_description"] || metaDescription);

  const favicon = resolveSingle(data["general.favicon"]);
  const ogImage =
    resolveSingle(data["seo.og_image"]) || resolveSingle(data["general.logo"]) || "/logo-2.png";

  return {
    metadataBase,
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    icons: {
      icon: [
        { url: favicon || "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
      ],
      shortcut: [favicon || "/favicon.ico"],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: metadataBase.origin,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }]
        : [{ url: "/logo-1.png", width: 1200, height: 630, alt: ogTitle }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : ["/logo-1.png"],
    },
  };
}

// --- Main Layout Component ---
export default async function Layout({ children }: { children: React.ReactNode }) {
  const [settingsPayload, session] = await Promise.all([
    fetchSettings(),
    getServerSession(authOptions),
  ]);

  const data = settingsPayload?.data ?? {};

  // Sanitize before passing to client components via RSC serialization
  const safeData = sanitizeForRSC(data);
  const safeSettingsPayload: SettingsPayload | null = settingsPayload
    ? { success: settingsPayload.success, data: safeData }
    : null;

  // --- Logic Schema.org ---
  const schemas: any[] = [];
  const enableOrg = data["seo.schema.organization"] === true;
  const enableWebsite = data["seo.schema.website"] === true;
  const brandName = safeString(data["general.title"]) || "Feryshop";
  const logo = resolveSingle(data["general.logo"]) || "/logo-1.png";

  if (enableOrg && brandName) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brandName,
      url: siteUrl,
      ...(logo ? { logo } : {}),
    });
  }

  if (enableWebsite && brandName) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: brandName,
      url: siteUrl,
    });
  }

  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <head>
        {schemas.map((schema, index) => (
          <script
            id={`schema-${index}`}
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className={GeistSans.className}>
        <ProgressBarWrapper className="bg-brand-blue fixed top-0 z-30 h-0.5">
          <Toaster position="top-center" theme="dark" />
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <SWRProvider>
              <SettingsProvider initialData={safeSettingsPayload}>
                <PanelLayout session={session}>{children}</PanelLayout>
              </SettingsProvider>
            </SWRProvider>
          </ThemeProvider>
        </ProgressBarWrapper>
      </body>
    </html>
  );
}
