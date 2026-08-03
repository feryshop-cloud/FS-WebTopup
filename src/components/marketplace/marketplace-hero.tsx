"use client";

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
      router.push(`/marketplace/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card/90 to-primary/5 p-4 sm:p-8 shadow-sm">
      {/* Background Decorative Glow */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full space-y-4 sm:space-y-8">
        {/* Title & Subtitle */}
        <div className="space-y-2 sm:space-y-3 max-w-4xl">
          <h1 className="text-xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
            Pusat Jual Beli Akun Game <span className="text-primary">Sultan & Terverifikasi</span>
          </h1>
          <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
            Platform jual beli akun game Sultan dengan sistem Rekber resmi Feryshop. Transaksi aman dikawal admin 24/7, garansi uang kembali, dan proses serah terima instan.
          </p>
        </div>

        {/* Search Bar Shortcut - Minimalist without icons */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Cari akun impian (mis: Mythic Glory)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 sm:px-4 h-9 sm:h-12 rounded-lg sm:rounded-xl border-border bg-background/80 backdrop-blur-sm text-xs sm:text-sm focus-visible:ring-primary shadow-sm"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 sm:h-12 rounded-lg sm:rounded-xl px-4 sm:px-6 font-semibold shadow-md text-xs sm:text-sm">
            <span>Cari Akun</span>
          </Button>
        </form>

        {/* Quick Value Props Grid - Minimalist Text Only */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-6 pt-3 sm:pt-4 border-t border-border/40 w-full">
          <div className="flex flex-col justify-center text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/40">
            <div className="text-[11px] sm:text-xs font-bold truncate leading-tight text-foreground">Rekber Resmi</div>
            <div className="text-[9px] sm:text-[11px] text-muted-foreground truncate leading-tight mt-0.5">Kawalan Admin 24/7</div>
          </div>

          <div className="flex flex-col justify-center text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/40">
            <div className="text-[11px] sm:text-xs font-bold truncate leading-tight text-foreground">Akun Verified</div>
            <div className="text-[9px] sm:text-[11px] text-muted-foreground truncate leading-tight mt-0.5">Seleksi Seller Ketat</div>
          </div>

          <div className="flex flex-col justify-center text-center p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-muted/30 border border-border/40">
            <div className="text-[11px] sm:text-xs font-bold truncate leading-tight text-foreground">Serah Instan</div>
            <div className="text-[9px] sm:text-[11px] text-muted-foreground truncate leading-tight mt-0.5">&lt; 5 Menit Cair</div>
          </div>
        </div>
      </div>
    </div>
  );
}
