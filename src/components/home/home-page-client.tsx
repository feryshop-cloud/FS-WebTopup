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

  const modifiedCategories = useMemo(() => {
    if (!dataCategories?.data) return dataCategories;
    // Cek agar tidak duplikat jika dipanggil berulang
    const hasAkunGame = dataCategories.data.some((c: any) => c.id === "akun-game");
    if (hasAkunGame) return dataCategories;

    return {
      ...dataCategories,
      data: [
        {
          id: "akun-game",
          title: "Katalog Akun Game",
          logo: null,
        },
        ...dataCategories.data,
      ],
    };
  }, [dataCategories]);

  const handleCategoryClick = useCallback((id: string) => {
    if (id === "akun-game") {
      scrollToSection("account-section");
    } else {
      setSelectedCategory(id);
      // Optional: scroll ke area topup jika pilih kategori lain agar list game terlihat
      // scrollToSection("topup-section");
    }
  }, []);

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

        {/* AC1 - Quick Menu (Menggantikan Quick Action Buttons lama) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
            <button
              onClick={() => scrollToSection("account-section")}
              className="border-border/50 bg-card hover:border-primary/40 focus-visible:ring-primary group relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 sm:rounded-3xl sm:p-6"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-all duration-500" />
              <div className="relative z-10 flex flex-col items-center gap-3 sm:items-start sm:gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                  <Gamepad2 className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-foreground text-sm font-bold sm:text-base">
                    Katalog Akun Game
                  </h3>
                  <p className="text-muted-foreground mt-1 hidden text-xs sm:block sm:text-sm">
                    Beli akun game pilihan dengan aman
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => scrollToSection("topup-section")}
              className="border-border/50 bg-card hover:border-primary/40 focus-visible:ring-primary group relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 sm:rounded-3xl sm:p-6"
            >
              <div className="bg-primary/10 group-hover:bg-primary/20 absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-all duration-500" />
              <div className="relative z-10 flex flex-col items-center gap-3 sm:items-start sm:gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14">
                  <Zap className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-foreground text-sm font-bold sm:text-base">Top Up Game</h3>
                  <p className="text-muted-foreground mt-1 hidden text-xs sm:block sm:text-sm">
                    Top up diamond instan dan cepat
                  </p>
                </div>
              </div>
            </button>
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
        <section
          id="account-section"
          className="scroll-mt-24 pb-8"
          aria-labelledby="account-section-title"
        >
          <FeaturedAccounts
            accounts={initialData.marketplaceAccounts}
            categories={initialData.marketplaceCategories}
          />
        </section>

        {/* 5. Layanan Top-Up Cepat - Section sekunder */}
        <section
          id="topup-section"
          className="border-border/70 bg-card/50 scroll-mt-24 rounded-3xl border p-4 pt-8 sm:p-6"
          aria-labelledby="topup-section-title"
        >
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
              dataCategories={isLoadingCategories ? undefined : modifiedCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryClick}
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
        </section>
      </div>

      <div className="mt-16">
        <Artikel initialData={initialData.blogLite} />
      </div>

      <PromoPopup initialData={initialData.popupPromo} />
    </ContentLayout>
  );
}
