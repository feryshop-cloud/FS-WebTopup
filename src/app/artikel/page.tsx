import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { Badge } from "@/components/ui/badge";
import { BlogListClient, type BlogLiteMeta } from "@/components/blog/blog-list-client";
import { getBlogLitePayload } from "@/lib/data/home";

export const metadata: Metadata = {
  title: "Feryshop | Artikel & Berita",
  description:
    "Berita, promo, dan panduan terbaru seputar game, top up digital, serta update marketplace akun game Feryshop.",
  openGraph: {
    title: "Feryshop | Artikel & Berita",
    description:
      "Berita, promo, dan panduan terbaru seputar game, top up digital, serta update marketplace akun game Feryshop.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feryshop | Artikel & Berita",
    description:
      "Berita, promo, dan panduan terbaru seputar game, top up digital, serta update marketplace akun game Feryshop.",
  },
};

export default async function ArtikelPage() {
  const payload = await getBlogLitePayload(1, 9);
  const articles = Array.isArray(payload.data) ? payload.data : [];
  const meta = payload.meta as BlogLiteMeta;

  return (
    <ContentLayout title="Artikel">
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">
            Artikel & Berita
          </Badge>
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Update Terbaru & Insight
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Berita, promo, dan panduan terbaru seputar game dan top up digital.
          </p>
        </div>

        <BlogListClient initialArticles={articles} initialMeta={meta} />
      </section>
    </ContentLayout>
  );
}
