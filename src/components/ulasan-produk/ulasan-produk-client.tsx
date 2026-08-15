"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ReviewItem, ReviewsMeta, ReviewsPayload } from "@/lib/data/reviews";

const PER_PAGE = 12;

interface UlasanProdukClientProps {
  initialReviews: ReviewItem[];
  initialMeta: ReviewsMeta;
}

export function UlasanProdukClient({ initialReviews, initialMeta }: UlasanProdukClientProps) {
  const [minRating, setMinRating] = useState<string>("0");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ReviewItem[]>(initialReviews);
  const [meta, setMeta] = useState<ReviewsMeta>(initialMeta);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  // SWR hanya aktif saat "Muat Lebih Banyak" diklik (page > 1).
  const swrKey = page > 1 ? `/api/reviews?page=${page}&per_page=${PER_PAGE}` : null;
  const { data, error, isLoading, mutate } = useSWR<ReviewsPayload>(swrKey, fetcher);

  useEffect(() => {
    if (!data) return;
    if (page > 1) {
      const nextItems = Array.isArray(data.data) ? data.data : [];
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

  const loadMore = () => {
    if (!canLoadMore || isLoading) return;
    setLoadMoreError(null);
    setPage((p) => p + 1);
  };

  const min = Number(minRating);
  const filtered = useMemo(() => {
    if (min <= 0) return items;
    return items.filter((r) => Number(r.rating) >= min);
  }, [items, min]);

  return (
    <section className="pb-16">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <Badge variant="secondary" className="mb-4">
          Testimoni Pembeli
        </Badge>
        <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">Ulasan Produk</h1>
        <p className="text-muted-foreground">Lihat pengalaman pembeli lain sebelum kamu top up.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">Total {meta.total} ulasan</div>

        <div className="flex items-center gap-2">
          <div className="text-muted-foreground text-sm">Filter rating</div>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Semua</SelectItem>
              <SelectItem value="5">5 ke atas</SelectItem>
              <SelectItem value="4">4 ke atas</SelectItem>
              <SelectItem value="3">3 ke atas</SelectItem>
              <SelectItem value="2">2 ke atas</SelectItem>
              <SelectItem value="1">1 ke atas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-muted-foreground rounded-lg border p-8 text-center">
          Belum ada ulasan.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="line-clamp-2 font-semibold">{r.product ?? "Produk"}</div>
                    <div className="text-muted-foreground text-xs">{r.game ?? ""}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {r.reviewer_display}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const v = idx + 1;
                    return (
                      <Star
                        key={v}
                        className={cn(
                          "h-4 w-4",
                          v <= Number(r.rating)
                            ? "text-my-color fill-current"
                            : "text-muted-foreground",
                        )}
                      />
                    );
                  })}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="whitespace-pre-wrap text-sm">{r.review_text}</div>
                <div className="text-muted-foreground mt-4 text-xs">
                  {r.created_at ? format(new Date(r.created_at), "dd MMM yyyy, HH:mm") : ""}
                </div>
              </CardContent>
            </Card>
          ))}
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
        <div className="mt-10 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading} className="shadow-none">
            {isLoading ? "Menghubungkan..." : "Muat Lebih Banyak"}
          </Button>
        </div>
      )}
    </section>
  );
}
