import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { UlasanProdukClient } from "@/components/ulasan-produk/ulasan-produk-client";
import { getReviewsPayload } from "@/lib/data/reviews";

export const metadata: Metadata = {
  title: "Feryshop | Ulasan & Rating Produk",
  description:
    "Lihat ulasan dan rating produk top up game dari pembeli Feryshop. Transparan, jujur, dan membantu kamu memilih sebelum top up.",
  openGraph: {
    title: "Feryshop | Ulasan & Rating Produk",
    description:
      "Lihat ulasan dan rating produk top up game dari pembeli Feryshop. Transparan, jujur, dan membantu kamu memilih sebelum top up.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feryshop | Ulasan & Rating Produk",
    description:
      "Lihat ulasan dan rating produk top up game dari pembeli Feryshop. Transparan, jujur, dan membantu kamu memilih sebelum top up.",
  },
};

export default async function UlasanProdukPage() {
  const payload = await getReviewsPayload(1, 12);

  return (
    <ContentLayout title="Ulasan Produk">
      <div className="mx-auto max-w-6xl px-4">
        <UlasanProdukClient initialReviews={payload.data} initialMeta={payload.meta} />
      </div>
    </ContentLayout>
  );
}
