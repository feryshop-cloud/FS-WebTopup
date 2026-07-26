"use client";

import { ShieldCheck, Sparkles, Clock, Lock, Store, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MarketplaceHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to MLBB category with search query by default or first category
      router.push(`/marketplace/mlbb?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-sm">
      {/* Background Decorative Glow */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full space-y-6 sm:space-y-8">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Store className="h-3.5 w-3.5" />
            Multi-SaaS Marketplace Akun
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Garansi 100% Anti-Hack
          </span>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3 max-w-4xl">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            Pusat Jual Beli Akun Game <span className="text-primary">Sultan & Terverifikasi</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Platform marketplace akun game modern pertama dengan sistem Rekber resmi TopupSon. Seluruh transaksi dikawal admin 24/7, garansi uang kembali jika akun bermasalah, dan proses serah terima data tercepat di bawah 5 menit.
          </p>
        </div>

        {/* Search Bar Shortcut */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari akun impian (mis: Mythic Glory, SG 2 Ungu, Kuronami)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 sm:h-12 rounded-xl border-border bg-background/80 backdrop-blur-sm text-sm focus-visible:ring-primary shadow-sm"
            />
          </div>
          <Button type="submit" className="h-11 sm:h-12 rounded-xl px-5 font-semibold gap-2 shadow-md">
            <span className="hidden sm:inline">Cari Akun</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick Value Props Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-border/40 w-full">
          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl bg-muted/30 border border-border/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-bold truncate">Rekber Resmi</div>
              <div className="text-[9px] sm:text-[11px] text-muted-foreground truncate">Kawalan Admin 24/7</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl bg-muted/30 border border-border/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-bold truncate">Akun Verified</div>
              <div className="text-[9px] sm:text-[11px] text-muted-foreground truncate">Seleksi Seller Ketat</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-2xl bg-muted/30 border border-border/40">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] sm:text-xs font-bold truncate">Serah Terima Instan</div>
              <div className="text-[9px] sm:text-[11px] text-muted-foreground truncate">&lt; 5 Menit Cair</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
