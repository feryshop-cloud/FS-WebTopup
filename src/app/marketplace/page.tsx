import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero";
import { MarketplaceCategoryGrid } from "@/components/marketplace/category-grid";
import { MarketplaceWhyUsSection } from "@/components/marketplace/why-us-section";
import { getMarketplaceCategories } from "@/lib/marketplace/live-marketplace";

export const metadata: Metadata = {
  title: "Feryshop | Pusat Jual Beli Akun Game Sultan & Terverifikasi #1 Di Indonesia",
  description: "Feryshop | Marketplace jual beli akun game Sultan (MLBB, Free Fire, Valorant, eFootball, PUBG Mobile) teraman & terpercaya dengan layanan Rekber resmi 24/7 dan garansi anti-hack 100%.",
  keywords: "feryshop, jual beli akun game, marketplace akun sultan, akun mlbb murah, beli akun free fire sultan, rekber feryshop, top up game murah, akun valorant murah, jual akun efootball",
  openGraph: {
    title: "Feryshop | Pusat Jual Beli Akun Game Sultan & Terverifikasi #1 Di Indonesia",
    description: "Marketplace jual beli akun game Sultan teraman dengan Rekber resmi Feryshop 24/7. Garansi anti-hack 100% dan proses serah terima kilat di bawah 5 menit.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function MarketplaceHomePage() {
  const categories = await getMarketplaceCategories();

  return (
    <ContentLayout title="Marketplace Akun Game">
      <div className="space-y-5 sm:space-y-8">
        <MarketplaceHero />
        <MarketplaceCategoryGrid categories={categories} />
        <MarketplaceWhyUsSection />
      </div>
    </ContentLayout>
  );
}
