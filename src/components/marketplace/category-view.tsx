"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ArrowLeft, SlidersHorizontal, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountCard } from "./account-card";
import { GameCategoryIcon } from "./category-grid";
import { MARKETPLACE_CATEGORIES, MOCK_ACCOUNTS, type GameCategory } from "@/lib/data/mock-marketplace";
import { cn } from "@/lib/utils";

export function MarketplaceCategoryView({ categorySlug }: { categorySlug: string }) {
  const category = MARKETPLACE_CATEGORIES.find((c) => c.slug === categorySlug) || MARKETPLACE_CATEGORIES[0];
  const allCategoryAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter((acc) => acc.gameSlug === category.slug);
  }, [category.slug]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("DEFAULT");
  const [selectedLogin, setSelectedLogin] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique login types from this category's accounts
  const availableLoginTypes = useMemo(() => {
    const types = new Set<string>();
    allCategoryAccounts.forEach((acc) => types.add(acc.specs.loginVia));
    return Array.from(types);
  }, [allCategoryAccounts]);

  // Filter & Sort Logic
  const filteredAccounts = useMemo(() => {
    return allCategoryAccounts
      .filter((acc) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = acc.title.toLowerCase().includes(q);
          const matchRank = acc.specs.rank.toLowerCase().includes(q);
          const matchDesc = acc.description.some((d) => d.toLowerCase().includes(q));
          if (!matchTitle && !matchRank && !matchDesc) return false;
        }
        // Rank filter
        if (selectedRank !== "ALL") {
          if (!acc.specs.rank.toLowerCase().includes(selectedRank.toLowerCase())) return false;
        }
        // Login via filter
        if (selectedLogin !== "ALL") {
          if (acc.specs.loginVia !== selectedLogin) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "PRICE_ASC") return a.price - b.price;
        if (selectedSort === "PRICE_DESC") return b.price - a.price;
        if (selectedSort === "DISCOUNT") {
          const discA = a.originalPrice ? a.originalPrice - a.price : 0;
          const discB = b.originalPrice ? b.originalPrice - b.price : 0;
          return discB - discA;
        }
        return 0; // DEFAULT (Featured first)
      });
  }, [allCategoryAccounts, searchQuery, selectedRank, selectedLogin, selectedSort]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRank("ALL");
    setSelectedSort("DEFAULT");
    setSelectedLogin("ALL");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/marketplace" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Katalog</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{category.name}</span>
      </div>

      {/* Category Header Banner */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-sm",
          category.colorTheme
        )}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-background border border-border/70 shadow-md">
              <GameCategoryIcon iconName={category.iconName} className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                  {allCategoryAccounts.length} Akun Tersedia
                </span>
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Update
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">{category.name}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">{category.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl border-border bg-background/80 gap-2 h-10 px-4 font-semibold shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Filter & Urutkan</span>
              {(selectedRank !== "ALL" || selectedLogin !== "ALL" || selectedSort !== "DEFAULT" || searchQuery) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                  !
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar & Quick Rank Filter Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Cari spesifikasi akun ${category.name} (misal: Sultan, Mythic, Skin)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 sm:h-12 rounded-xl border-border bg-card text-sm focus-visible:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Sort Dropdown / Selector */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="h-11 sm:h-12 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm sm:w-56"
          >
            <option value="DEFAULT">🔥 Rekomendasi (Sultan)</option>
            <option value="PRICE_ASC">💰 Harga Termurah</option>
            <option value="PRICE_DESC">💎 Harga Termahal</option>
            <option value="DISCOUNT">🏷️ Diskon Terbesar</option>
          </select>
        </div>

        {/* Quick Filter Pills (Rank) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-muted-foreground shrink-0 mr-1">Rank Populer:</span>
          <button
            type="button"
            onClick={() => setSelectedRank("ALL")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shrink-0",
              selectedRank === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
            )}
          >
            Semua Rank
          </button>
          {category.popularRanks.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => setSelectedRank(selectedRank === rank ? "ALL" : rank)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-bold transition-all shrink-0",
                selectedRank === rank
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
              )}
            >
              {rank}
            </button>
          ))}
        </div>

        {/* Expanded Filter Drawer / Panel */}
        {showFilters && (
          <div className="rounded-2xl border border-primary/20 bg-muted/40 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Filter Lanjutan</span>
              </div>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-3 text-xs text-muted-foreground hover:text-primary gap-1">
                <RefreshCw className="h-3 w-3" />
                Reset Semua Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Login Via Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Tipe Login / Bind Akun:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLogin("ALL")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all",
                      selectedLogin === "ALL"
                        ? "bg-primary/20 border-primary text-primary font-bold"
                        : "bg-card border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Semua Login
                  </button>
                  {availableLoginTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedLogin(selectedLogin === type ? "ALL" : type)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all",
                        selectedLogin === type
                          ? "bg-primary/20 border-primary text-primary font-bold"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Jaminan Keamanan Rekber:</label>
                <div className="rounded-xl bg-card p-3 border border-border/60 text-xs text-muted-foreground space-y-1">
                  <div className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    100% All Monsep & Clean Data
                  </div>
                  <div>Seluruh akun dalam kategori ini siap bind ke email baru pembeli dengan kawalan admin.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Cards Grid (Mobile First: 1 col on mobile, 2 on sm, 3 on lg) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span>Menampilkan <span className="text-foreground">{filteredAccounts.length}</span> akun {category.name}</span>
          {(selectedRank !== "ALL" || selectedLogin !== "ALL" || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-primary hover:underline font-semibold"
            >
              Hapus Filter Active
            </button>
          )}
        </div>

        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-x-6 sm:gap-y-6">
            {filteredAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card/50">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Akun Tidak Ditemukan</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                Belum ada akun yang sesuai dengan kata kunci atau filter pencarian kamu saat ini. Coba reset filter atau gunakan kata kunci yang lebih umum.
              </p>
            </div>
            <Button onClick={resetFilters} variant="outline" className="rounded-xl px-6 font-semibold">
              Reset Semua Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
