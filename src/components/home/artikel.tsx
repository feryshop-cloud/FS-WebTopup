"use client";

import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ImageOff, ArrowRight } from "lucide-react";

import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { HomeFallbackData } from "@/lib/data/home";

type BlogCategoryLite = {
  id: number;
  title: string;
  slug: string;
};

type BlogLite = {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  excerpt?: string | null;
  category?: BlogCategoryLite | null;
};

type BlogLiteResponse = {
  success?: boolean;
  data?: BlogLite[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

export default function Artikel({ initialData }: { initialData?: HomeFallbackData["blogLite"] }) {
  const { data, error, isLoading, mutate } = useSWR<BlogLiteResponse>(
    "/api/blog-lite?page=1&per_page=6",
    fetcher,
    { fallbackData: initialData as any },
  );

  const blogs: BlogLite[] = Array.isArray(data?.data) ? data!.data! : [];

  return (
    <section className="pb-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-2xl">Artikel Terbaru</h2>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Dapatkan info terbaru seputar dunia game, promo, update top-up, dan tips komunitas.
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="hidden rounded-full sm:inline-flex">
          <Link href="/artikel">Lihat Semua</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="min-w-[85%] overflow-hidden rounded-xl border-none shadow-sm sm:min-w-0"
            >
              <Skeleton className="aspect-[16/9] w-full" />
              <CardContent className="bg-card space-y-3 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="border-destructive/20 bg-destructive/5 rounded-xl border p-6 text-center">
          <p className="text-destructive text-sm font-medium">Gagal memuat artikel</p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => mutate()}
          >
            Coba Lagi
          </Button>
        </div>
      ) : (
        <>
          {blogs.length === 0 ? (
            <div className="rounded-xl border border-dashed p-10 text-center">
              <p className="text-muted-foreground text-sm">Belum ada artikel terbaru.</p>
            </div>
          ) : (
            <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
              {blogs.map((post) => {
                const label = post.category?.title?.trim() ? post.category.title : "Berita";
                return (
                  <Card
                    key={post.id}
                    className={cn(
                      "hover:ring-primary/20 group min-w-[85%] overflow-hidden rounded-xl border-none shadow-sm transition-all hover:ring-2 sm:min-w-0",
                    )}
                  >
                    <Link href={`/artikel/${post.slug}`} className="block">
                      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="text-muted-foreground/40 flex h-full flex-col items-center justify-center">
                            <ImageOff className="mb-1 h-8 w-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-primary/90 hover:bg-primary border-none text-[10px] font-bold uppercase tracking-wider">
                            {label}
                          </Badge>
                        </div>
                      </div>
                    </Link>

                    <CardContent className="bg-card space-y-3 p-4">
                      <Link href={`/artikel/${post.slug}`} className="block">
                        <h3 className="group-hover:text-primary line-clamp-2 font-bold leading-tight transition-colors">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                        {post.excerpt || "Klik untuk membaca detail artikel selengkapnya."}
                      </p>

                      <div className="pt-1">
                        <Link
                          href={`/artikel/${post.slug}`}
                          className="text-primary inline-flex items-center gap-1.5 text-xs font-bold transition-all hover:gap-3"
                        >
                          Baca Selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-4 sm:hidden">
            <Button
              asChild
              variant="outline"
              className="border-primary/20 text-primary w-full rounded-full"
            >
              <Link href="/artikel">Lihat Semua Artikel</Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
