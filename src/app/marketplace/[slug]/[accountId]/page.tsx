import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceAccountDetailView } from "@/components/marketplace/account-detail-view";
import { MOCK_ACCOUNTS } from "@/lib/data/mock-marketplace";

interface AccountDetailPageProps {
  params: Promise<{
    slug: string;
    accountId: string;
  }>;
}

export async function generateMetadata({ params }: AccountDetailPageProps): Promise<Metadata> {
  const { accountId } = await params;
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId || a.slug === accountId);
  if (!account) {
    return { title: "Detail Akun - TopupSon Marketplace" };
  }
  return {
    title: `${account.title} | Beli Akun ${account.gameName} - TopupSon`,
    description: `Beli ${account.title} seharga Rp ${account.price.toLocaleString("id-ID")}. Garansi 100% Anti-Hack via Rekber resmi TopupSon.`,
  };
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { slug, accountId } = await params;
  const account = MOCK_ACCOUNTS.find((a) => a.id === accountId || a.slug === accountId);

  if (!account || account.gameSlug !== slug) {
    notFound();
  }

  return (
    <ContentLayout title={account.title}>
      <div className="space-y-8">
        <MarketplaceAccountDetailView accountId={accountId} />
      </div>
    </ContentLayout>
  );
}
