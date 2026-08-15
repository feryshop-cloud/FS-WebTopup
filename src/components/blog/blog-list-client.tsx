"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, Eye, ImageOff } from "lucide-react";
import { format } from "date-fns";

export type BlogCategoryLite = {
  id: number;
  title: string;
  slug: string;
};

export type BlogLite = {
  id: number;
  title: string;
  slug: string;
  image?: string | null;
  published_at?: string | null;
  views?: number | null;
  excerpt?: string | null;
  category?: BlogCategoryLite | null;
};

export type BlogLiteMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type BlogLiteResponse = {
  success?: boolean;
  data?: BlogLite[];
  meta?: BlogLiteMeta;
};

const PER_PAGE = 9;

const safeDate = (v: any) => {
  const d = v ? new Date(v) : null;
  if (!d) return null;
  return Number.isNaN(d.getTime()) ? null : d;
};

interface BlogListClientProps {
  initialArticles: BlogLite[];
  initialMeta: BlogLiteMeta;
}

export function BlogListClient({ initialArticles, initialMeta }: BlogListClientProps) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BlogLite[]>(initialArticles);
  const [meta, setMeta] = useState<BlogLiteMeta>(initialMeta);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // SWR hanya aktif saat "Muat Lebih Banyak" diklik (page > 1).
  const swrKey = page > 1 ? `/api/blog-lite?page=${page}&per_page=${PER_PAGE}` : null;
  const { data, error, isLoading, mutate } = useSWR<BlogLiteResponse>(swrKey, fetcher);

  useEffect(() => {
    if (!data) return;
    const nextItems = Array.isArray(data.data) ? data.data : [];
    if (page > 1) {
      setItems((prev) => {
        const existing = new Set(prev.map((x) => String(x.id)));
        const merged = [...prev];
        for (const it of nextItems) {
          if (!existing.has(String(it.id))) merged.push(it);
        }
        return merged;
      });
    }
    if (data.meta) {
      setMeta(data.meta);
      setLoadMoreError(null);
    }
  }, [data, page]);

  const canLoadMore = useMemo(() => {
    return meta.current_page < meta.last_page;
  }, [meta]);

  const loadMore = useCallback(() => {
    if (!canLoadMore || isLoading) return;
    setLoadMoreError(null);
    setPage((p) => p + 1);
  }, [canLoadMore, isLoading]);

  return (
    <div className="space-y-8">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <div className="text-muted-foreground">Belum ada artikel yang dipublikasikan.</div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => {
            const d = safeDate(post.published_at);
            const label = post.category?.title?.trim() ? post.category.title : null;

            return (
              <Card
                key={post.id}
                className="hover:ring-primary/20 flex flex-col overflow-hidden transition-all hover:ring-2"
              >
                <Link
                  href={`/artikel/${post.slug}`}
                  className="bg-muted relative aspect-video w-full overflow-hidden"
                >
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20">
                      <ImageOff className="h-10 w-10" />
                    </div>
                  )}
                </Link>

                <CardHeader className="space-y-2">
                  {label && (
                    <div>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                        {label}
                      </Badge>
                    </div>
                  )}

                  <h3 className="line-clamp-2 text-lg font-bold leading-tight">
                    <Link
                      href={`/artikel/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3 text-sm">
                    {post.excerpt ||
                      "Klik untuk membaca detail informasi selengkapnya mengenai berita ini."}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-4 text-xs font-medium">
                  <div className="text-muted-foreground flex items-center gap-4">
                    <span>{d ? format(d, "dd MMM yyyy") : "-"}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {post.views ?? 0}
                    </span>
                  </div>
                  <Link
                    href={`/artikel/${post.slug}`}
                    className="text-primary flex items-center gap-1"
                  >
                    Baca Selengkapnya <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-6">
          <LoadingSpinner size={28} />
        </div>
      )}

      {(error || loadMoreError) && (
        <div className="border-destructive/20 bg-destructive/5 text-destructive mt-6 rounded-xl border p-4 text-sm">
          {String((error as any)?.message || error || loadMoreError)}
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => mutate()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      )}

      {canLoadMore && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isLoading}
            className="rounded-full px-8"
          >
            {isLoading ? "Menghubungkan..." : "Tampilkan Lebih Banyak"}
          </Button>
        </div>
      )}
    </div>
  );
}
