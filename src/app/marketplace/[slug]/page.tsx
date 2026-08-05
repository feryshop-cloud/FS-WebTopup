import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceCategoryView } from "@/components/marketplace/category-view";
import {
  getMarketplaceAccounts,
  getMarketplaceCategories,
} from "@/lib/marketplace/live-marketplace";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getMarketplaceCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return { title: "Feryshop | Kategori Tidak Ditemukan" };
  }
  return {
    title: `Feryshop | Jual Beli Akun ${category.name} Sultan & Terverifikasi`,
    description: `Feryshop | Katalog akun ${category.name} sultan terverifikasi dengan garansi anti-hack 100% via Rekber resmi Feryshop. ${category.subtitle}`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { q = "" } = await searchParams;
  const [accounts, categories] = await Promise.all([
    getMarketplaceAccounts(),
    getMarketplaceCategories(),
  ]);
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <ContentLayout title={`Katalog ${category.name}`}>
      <div className="space-y-8">
        <MarketplaceCategoryView
          categorySlug={slug}
          accounts={accounts}
          categories={categories}
          initialQuery={q}
        />
      </div>
    </ContentLayout>
  );
}
