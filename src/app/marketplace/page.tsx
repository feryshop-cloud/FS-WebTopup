import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceHero } from "@/components/marketplace/marketplace-hero";
import { MarketplaceCategoryGrid } from "@/components/marketplace/category-grid";
import { MarketplaceWhyUsSection } from "@/components/marketplace/why-us-section";

export const metadata: Metadata = {
  title: "Marketplace Jual Beli Akun Game Sultan - TopupSon",
  description: "Platform jual beli akun game Multi-SaaS mobile teraman dengan Rekber resmi TopupSon. Temukan akun Sultan MLBB, Free Fire, Valorant, eFootball, dan PUBG Mobile.",
};

export default function MarketplaceHomePage() {
  return (
    <ContentLayout title="Marketplace Akun Game">
      <div className="space-y-8">
        <MarketplaceHero />
        <MarketplaceCategoryGrid />
        <MarketplaceWhyUsSection />
      </div>
    </ContentLayout>
  );
}
