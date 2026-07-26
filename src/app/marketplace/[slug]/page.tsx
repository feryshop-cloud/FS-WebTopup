import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceCategoryView } from "@/components/marketplace/category-view";
import { MARKETPLACE_CATEGORIES } from "@/lib/data/mock-marketplace";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);
  if (!category) {
    return { title: "Kategori Tidak Ditemukan - TopupSon" };
  }
  return {
    title: `Jual Beli Akun ${category.name} Sultan & Aman - TopupSon`,
    description: `Katalog akun ${category.name} terverifikasi dengan garansi anti-hack 100% via Rekber TopupSon. ${category.subtitle}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <ContentLayout title={`Katalog ${category.name}`}>
      <div className="space-y-8">
        <MarketplaceCategoryView categorySlug={slug} />
      </div>
    </ContentLayout>
  );
}
