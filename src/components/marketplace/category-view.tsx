"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ArrowLeft,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountCard } from "./account-card";
import { GameCategoryIcon } from "./category-grid";
import {
  MARKETPLACE_CATEGORIES,
  MOCK_ACCOUNTS,
  type GameAccount,
  type GameCategory,
} from "@/lib/data/mock-marketplace";
import { cn } from "@/lib/utils";

export function MarketplaceCategoryView({
  categorySlug,
  accounts = MOCK_ACCOUNTS,
  categories = MARKETPLACE_CATEGORIES,
  initialQuery = "",
}: {
  categorySlug: string;
  accounts?: GameAccount[];
  categories?: GameCategory[];
  initialQuery?: string;
}) {
  const category =
    categorySlug === "all"
      ? ({
          id: "all",
          name: "Semua Game",
          slug: "all",
          subtitle: "Hasil Pencarian Global",
          iconName: "mlbb",
          bannerUrl: "",
          totalAccounts: accounts.length,
          colorTheme: "from-primary/20 to-secondary/20",
          popularRanks: [],
        } as GameCategory)
      : categories.find((c) => c.slug === categorySlug) ||
        categories[0] ||
        MARKETPLACE_CATEGORIES[0];

  const allCategoryAccounts = useMemo(() => {
    if (categorySlug === "all") return accounts;
    return accounts.filter((acc) => acc.gameSlug === category.slug);
  }, [accounts, category.slug, categorySlug]);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<GameAccount[]>(
    initialQuery.trim().length >= 2 ? accounts : [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRank, setSelectedRank] = useState<string>("ALL");
  const [selectedSort, setSelectedSort] = useState<string>("DEFAULT");
  const [selectedLogin, setSelectedLogin] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced vector search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams({
          q,
          ...(categorySlug !== "all" && { gameSlug: category.slug }),
        });
        const res = await fetch(`/api/search-accounts?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, categorySlug, category.slug]);

  // Extract unique login types from this category's accounts
  const availableLoginTypes = useMemo(() => {
    const types = new Set<string>();
    const baseAccounts = searchQuery.trim().length >= 2 ? searchResults : allCategoryAccounts;
    baseAccounts.forEach((acc) => types.add(acc.specs.loginVia));
    return Array.from(types);
  }, [allCategoryAccounts, searchResults, searchQuery]);

  // Filter & Sort Logic
  const filteredAccounts = useMemo(() => {
    const baseAccounts = searchQuery.trim().length >= 2 ? searchResults : allCategoryAccounts;

    return baseAccounts
      .filter((acc) => {
        // Client-side search fallback for short queries
        if (searchQuery.trim() && searchQuery.trim().length < 2) {
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
  }, [allCategoryAccounts, searchResults, searchQuery, selectedRank, selectedLogin, selectedSort]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRank("ALL");
    setSelectedSort("DEFAULT");
    setSelectedLogin("ALL");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button & Breadcrumb */}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Link
          href="/marketplace"
          className="hover:text-primary inline-flex items-center gap-1.5 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Daftar Akun</span>
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{category.name}</span>
      </div>

      {/* Category Header Banner */}
      <div
        className={cn(
          "border-border/80 from-card via-card to-primary/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-sm sm:p-8",
          category.colorTheme,
        )}
      >
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="bg-background border-border/70 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-md sm:h-16 sm:w-16">
              <GameCategoryIcon iconName={category.iconName} className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold">
                  {allCategoryAccounts.length} Akun Tersedia
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live Update
                </span>
              </div>
              <h1 className="text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
                {category.name}
              </h1>
              <p className="text-muted-foreground max-w-xl text-xs sm:text-sm">
                {category.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-border bg-background/80 h-10 gap-2 rounded-xl px-4 font-semibold shadow-sm"
            >
              <SlidersHorizontal className="text-primary h-4 w-4" />
              <span>Filter & Urutkan</span>
              {(selectedRank !== "ALL" ||
                selectedLogin !== "ALL" ||
                selectedSort !== "DEFAULT" ||
                searchQuery) && (
                <span className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold">
                  !
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar & Quick Rank Filter Pills */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder={`Cari spesifikasi akun ${category.name} (misal: Sultan, Mythic, Skin)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-card focus-visible:ring-primary h-11 rounded-xl pl-10 text-sm shadow-sm sm:h-12"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Sort Dropdown / Selector */}
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="border-border bg-card text-foreground focus:ring-primary h-11 rounded-xl border px-4 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 sm:h-12 sm:w-56"
          >
            <option value="DEFAULT">Rekomendasi (Sultan)</option>
            <option value="PRICE_ASC">Harga Termurah</option>
            <option value="PRICE_DESC">Harga Termahal</option>
            <option value="DISCOUNT">Diskon Terbesar</option>
          </select>
        </div>

        {/* Quick Filter Pills (Rank) */}
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-muted-foreground mr-1 shrink-0 text-xs font-bold">
            Rank Populer:
          </span>
          <button
            type="button"
            onClick={() => setSelectedRank("ALL")}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
              selectedRank === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50 border",
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
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all",
                selectedRank === rank
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground border-border/50 border",
              )}
            >
              {rank}
            </button>
          ))}
        </div>

        {/* Expanded Filter Drawer / Panel */}
        {showFilters && (
          <div className="border-primary/20 bg-muted/40 animate-in fade-in slide-in-from-top-2 space-y-4 rounded-2xl border p-5 duration-200">
            <div className="border-border/50 flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Filter className="text-primary h-4 w-4" />
                <span className="text-foreground text-sm font-bold">Filter Lanjutan</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-primary h-8 gap-1 px-3 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Semua Filter
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Login Via Filter */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-bold">
                  Tipe Login / Bind Akun:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLogin("ALL")}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                      selectedLogin === "ALL"
                        ? "bg-primary/20 border-primary text-primary font-bold"
                        : "bg-card border-border text-muted-foreground hover:text-foreground",
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
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                        selectedLogin === type
                          ? "bg-primary/20 border-primary text-primary font-bold"
                          : "bg-card border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Info */}
              <div className="space-y-2">
                <label className="text-muted-foreground text-xs font-bold">
                  Jaminan Keamanan Rekber:
                </label>
                <div className="bg-card border-border/60 text-muted-foreground space-y-1 rounded-xl border p-3 text-xs">
                  <div className="text-foreground flex items-center gap-1.5 font-bold">
                    <Sparkles className="text-primary h-3.5 w-3.5" />
                    100% All Monsep & Clean Data
                  </div>
                  <div>
                    Seluruh akun dalam kategori ini siap bind ke email baru pembeli dengan kawalan
                    admin.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Cards Grid (Mobile First: 1 col on mobile, 2 on sm, 3 on lg) */}
      <div className="space-y-4">
        <div className="text-muted-foreground flex items-center justify-between text-xs font-bold">
          <span>
            Menampilkan <span className="text-foreground">{filteredAccounts.length}</span> akun{" "}
            {category.name}
          </span>
          {(selectedRank !== "ALL" || selectedLogin !== "ALL" || searchQuery) && (
            <button onClick={resetFilters} className="text-primary font-semibold hover:underline">
              Hapus Filter Active
            </button>
          )}
        </div>

        {isSearching ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <RefreshCw className="text-primary h-8 w-8 animate-spin" />
            <p className="text-muted-foreground text-sm">Mencari akun terbaik untukmu...</p>
          </div>
        ) : filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        ) : (
          <div className="border-border bg-card/50 space-y-4 rounded-3xl border border-dashed p-12 text-center">
            <div className="bg-muted text-muted-foreground mx-auto flex h-14 w-14 items-center justify-center rounded-full">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-foreground text-base font-bold">Akun Tidak Ditemukan</h3>
              <p className="text-muted-foreground mx-auto max-w-md text-xs sm:text-sm">
                Belum ada akun yang sesuai dengan kata kunci atau filter pencarian kamu saat ini.
                Coba reset filter atau gunakan kata kunci yang lebih umum.
              </p>
            </div>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="rounded-xl px-6 font-semibold"
            >
              Reset Semua Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
