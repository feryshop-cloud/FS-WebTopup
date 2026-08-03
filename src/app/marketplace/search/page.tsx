import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceCategoryView } from "@/components/marketplace/category-view";
import { getMarketplaceAccounts, getMarketplaceCategories } from "@/lib/marketplace/live-marketplace";

export const metadata: Metadata = {
  title: "Feryshop | Pencarian Akun Game Sultan",
  description: "Cari akun game sultan terverifikasi dengan garansi anti-hack 100% via Rekber resmi Feryshop.",
};

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const [accounts, categories] = await Promise.all([
    getMarketplaceAccounts(),
    getMarketplaceCategories(),
  ]);

  return (
    <ContentLayout title="Pencarian Marketplace">
      <div className="space-y-8">
        <MarketplaceCategoryView
          categorySlug="all"
          accounts={accounts}
          categories={categories}
          initialQuery={q}
        />
      </div>
    </ContentLayout>
  );
}
