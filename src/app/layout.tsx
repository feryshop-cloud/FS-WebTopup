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
    console.error("Layout fetch settings failed:", error);
    return null;
  }
}

// --- Metadata Generator ---
export async function generateMetadata(): Promise<Metadata> {
  const metadataBase = new URL(siteUrl);
  const settings = await fetchSettings();
  const data = settings?.data ?? {};

  // SEO Basics
  const metaTitle = safeString(data["seo.title"] || data["general.title"] || "Feryshop | Pusat Jual Beli & Top Up Akun Game Sultan #1 Terpercaya");
  const metaDescription = safeString(data["seo.description"] || "Feryshop | Marketplace jual beli akun game Sultan (MLBB, Free Fire, Valorant, eFootball, PUBG Mobile) & layanan top up game murah, cepat, teraman dengan Rekber resmi 24/7 dan garansi anti-hack 100%.");
  const metaKeywords = safeString(data["seo.keywords"] || "feryshop, jual beli akun game, marketplace akun game sultan, top up game murah, rekber akun game terpercaya, akun mlbb sultan, beli akun free fire, top up mobile legends murah, feryshop rekber");

  // OG & Twitter
  const ogTitle = safeString(data["seo.og_title"] || metaTitle);
  const ogDescription = safeString(data["seo.og_description"] || metaDescription);
  
  const favicon = resolveSingle(data["general.favicon"]);
  const ogImage = resolveSingle(data["seo.og_image"]) || resolveSingle(data["general.logo"]) || "/logo-2.png";

  return {
    metadataBase,
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    icons: { icon: favicon || "/favicon.ico" },
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
  const settingsPayload = await fetchSettings();
  const data = settingsPayload?.data ?? {};

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
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className={GeistSans.className}>
        <ProgressBarWrapper className="fixed top-0 h-0.5 bg-brand-blue z-30">
          <Toaster position="top-center" theme="dark" />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
          >
            <SWRProvider>
              <SettingsProvider initialData={settingsPayload}>
                <PanelLayout>{children}</PanelLayout>
              </SettingsProvider>
            </SWRProvider>
          </ThemeProvider>
        </ProgressBarWrapper>
      </body>
    </html>
  );
}
