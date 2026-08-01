import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentLayout } from "@/components/panel/content-layout";
import { MarketplaceAccountDetailView } from "@/components/marketplace/account-detail-view";
import { getMarketplaceAccount } from "@/lib/marketplace/live-marketplace";

interface AccountDetailPageProps {
  params: Promise<{
    slug: string;
    accountId: string;
  }>;
}

export async function generateMetadata({ params }: AccountDetailPageProps): Promise<Metadata> {
  const { accountId } = await params;
  const account = await getMarketplaceAccount(accountId);
  if (!account) {
    return { title: "Feryshop | Detail Akun Marketplace" };
  }
  return {
    title: `Feryshop | ${account.title} - Akun ${account.gameName} Sultan`,
    description: `Feryshop | Beli akun ${account.title} (${account.gameName}) murah seharga Rp ${account.price.toLocaleString("id-ID")}. Garansi 100% anti-hack via Rekber resmi 24/7.`,
  };
}

export default async function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { slug, accountId } = await params;
  const account = await getMarketplaceAccount(accountId);

  if (!account || account.gameSlug !== slug) {
    notFound();
  }

  return (
    <ContentLayout title={account.title}>
      <div className="space-y-8">
        <MarketplaceAccountDetailView account={account} />
      </div>
    </ContentLayout>
  );
}
