"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import useSWR from "swr";
import { ContentLayout } from "@/components/panel/content-layout";
import { Slider } from "@/components/home/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { PopularGames } from "@/components/home/game-populer";
import { GameCategories } from "@/components/home/game-category";
import { GameList } from "@/components/home/game-list";
import Promo from "@/components/home/promo";
import PromoPopup from "@/components/home/promo-popup";
import Artikel from "@/components/home/artikel";
import { FeaturedAccounts } from "@/components/home/featured-accounts";
import { Button } from "@/components/ui/button";
import { Zap, Gamepad2 } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import type { HomeFallbackData } from "@/lib/data/home";

const swrOptions = {
  revalidateOnFocus: false,
  revalidateIfStale: true,
  dedupingInterval: 300_000,
  keepPreviousData: true,
};

/**
 * Scroll smoothly to a section by ID.
 * @param id - The DOM element ID to scroll to (without #)
 */
function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HomePageClient({ initialData }: { initialData: HomeFallbackData }) {
  const {
    data: dataSlider,
    error: errorSlider,
    mutate: mutateSlider,
  } = useSWR("/api/slider", fetcher, {
    ...swrOptions,
    fallbackData: initialData.slider,
  });

  const {
    data: dataCategories,
    error: errorCategories,
    mutate: mutateCategories,
  } = useSWR("/api/category", fetcher, {
    ...swrOptions,
    fallbackData: initialData.categories,
  });

  const {
    data: dataGames,
    error: errorGames,
    mutate: mutateGames,
  } = useSWR("/api/games", fetcher, {
    ...swrOptions,
    fallbackData: initialData.games,
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryRef = useRef<HTMLDivElement | null>(null);

  const scrollCategories = useCallback((direction: "left" | "right") => {
    if (!categoryRef.current) return;
    categoryRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    });
  }, []);

  const filteredGames = useMemo(() => {
    if (!dataGames) return [];
    const list = Array.isArray(dataGames?.games) ? dataGames.games : [];
    if (!selectedCategory || list.length === 0) return list;

    const category = (dataCategories?.data ?? []).find(
      (c: any) => String(c.id) === String(selectedCategory),
    );

    const matches = (game: any): boolean => {
      if (String(game.category_id) === String(selectedCategory)) return true;
      if (category?.game && game.slug === category.game) return true;
      return false;
    };

    const filtered = list.filter(matches);
    return filtered;
  }, [dataGames, dataCategories, selectedCategory]);

  const isLoadingGames = !dataGames && !errorGames;
  const isLoadingCategories = !dataCategories && !errorCategories;
  const isLoadingSlider = !dataSlider && !errorSlider;

  const hasAnyError = Boolean(errorSlider || errorCategories || errorGames);

  const retryAll = async () => {
    const tasks: Promise<any>[] = [];
    tasks.push(mutateSlider());
    tasks.push(mutateCategories());
    tasks.push(mutateGames());
    await Promise.allSettled(tasks);
  };

  return (
    <ContentLayout title="Beranda">
      <div className="space-y-8">
        {/* 1. Hero Slider - Banner promo & highlight akun terlaris */}
        <div className="w-full pt-1">
          {isLoadingSlider ? (
            <Skeleton className="h-[150px] w-full rounded-2xl sm:h-[220px] md:h-[280px] lg:h-[340px]" />
          ) : errorSlider ? (
            <div className="border-border/50 bg-muted/20 rounded-2xl border p-6 text-center">
              <div className="text-sm font-medium">Gagal memuat banner</div>
              <div className="text-muted-foreground mt-1 text-xs">
                {(errorSlider as Error)?.message ?? "Terjadi kesalahan."}
              </div>
              <div className="mt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => mutateSlider()}>
                  Coba Lagi
                </Button>
              </div>
            </div>
          ) : (
            <Slider slides={dataSlider?.data ?? []} />
          )}
        </div>

        {/* Quick Action Buttons - Dual intent self-segmentation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button
              variant="default"
              size="lg"
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              onClick={() => scrollToSection("topup-section")}
              aria-label="Scroll ke katalog Top-Up"
            >
              <Zap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="font-bold text-base">⚡ Top Up Cepat</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl border-2 border-primary/30 bg-card text-primary shadow-sm hover:bg-primary/5 hover:border-primary/50 transition-all duration-200"
              onClick={() => scrollToSection("account-section")}
              aria-label="Scroll ke katalog Akun Game"
            >
              <Gamepad2 className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="font-bold text-base">🎮 Beli Akun Game</span>
            </Button>
          </div>
        </div>

        {hasAnyError && (
          <div className="border-border bg-muted/30 rounded-xl border p-6">
            <div className="text-sm font-medium">Sebagian data gagal dimuat</div>
            <div className="text-muted-foreground mt-1 text-xs">
              {errorGames ? (errorGames as Error)?.message : null}
              {errorGames && (errorCategories || errorSlider) ? " - " : null}
              {errorCategories ? (errorCategories as Error)?.message : null}
              {errorCategories && errorSlider ? " - " : null}
              {errorSlider ? (errorSlider as Error)?.message : null}
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="button" onClick={retryAll}>
                Coba Lagi
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  mutateGames();
                  mutateCategories();
                  mutateSlider();
                }}
              >
                Refresh Data
              </Button>
            </div>
          </div>
        )}

        {/* 2-4. Kategori Game Akun, Katalog Akun Pilihan, Jaminan Keamanan - Marketplace section */}
        <div id="account-section">
          <FeaturedAccounts
            accounts={initialData.marketplaceAccounts}
            categories={initialData.marketplaceCategories}
          />
        </div>

        {/* 5. Layanan Top-Up Cepat - Section sekunder */}
        <div id="topup-section" className="border-border/70 bg-card/50 rounded-3xl border p-4 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="bg-primary/10 text-primary border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
                Layanan Top-Up Cepat
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Butuh diamond, skin, atau voucher game? Top-up instan di sini
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <Promo initialData={initialData.promo} />

            <PopularGames isLoading={isLoadingGames} popularGames={dataGames?.populerGames} />

            <GameCategories
              dataCategories={isLoadingCategories ? undefined : dataCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(id) => setSelectedCategory(String(id))}
              scrollCategories={scrollCategories}
              categoryRef={categoryRef}
            />

            <GameList isLoading={isLoadingGames} filteredGames={filteredGames} />

            {!isLoadingGames && !errorGames && filteredGames.length === 0 && (
              <div className="text-muted-foreground py-6 text-center text-sm">
                Tidak ada game pada kategori ini
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Artikel initialData={initialData.blogLite} />
      </div>

      <PromoPopup initialData={initialData.popupPromo} />
    </ContentLayout>
  );
}
