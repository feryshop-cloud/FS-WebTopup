import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { PriceListClient } from "@/components/price-list/price-list-client";
import { getPriceListGames } from "@/lib/data/price-list";

export const metadata: Metadata = {
  title: "Feryshop | Daftar Harga Produk Top Up",
  description:
    "Lihat daftar harga lengkap top up game di Feryshop. Murah, cepat, dan terpercaya dengan garansi 100% legal dan proses instan.",
  openGraph: {
    title: "Feryshop | Daftar Harga Produk Top Up",
    description:
      "Lihat daftar harga lengkap top up game di Feryshop. Murah, cepat, dan terpercaya dengan garansi 100% legal dan proses instan.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feryshop | Daftar Harga Produk Top Up",
    description:
      "Lihat daftar harga lengkap top up game di Feryshop. Murah, cepat, dan terpercaya dengan garansi 100% legal dan proses instan.",
  },
};

export default async function PriceListPage() {
  const games = await getPriceListGames();

  return (
    <ContentLayout title="Daftar Produk">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Daftar Harga Produk</h2>
          <p className="text-muted-foreground text-sm">
            Pilih game, lalu order produk yang kamu inginkan.
          </p>
        </div>

        <PriceListClient games={games} />
      </div>
    </ContentLayout>
  );
}
