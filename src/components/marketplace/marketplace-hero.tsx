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
    <div className="border-border/40 from-card via-card/90 to-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-sm sm:p-8">
      {/* Background Decorative Glow */}
      <div className="bg-primary/15 pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 w-full space-y-4 sm:space-y-8">
        {/* Title & Subtitle */}
        <div className="max-w-4xl space-y-2 sm:space-y-3">
          <h1 className="text-foreground text-xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Pusat Jual Beli Akun Game <span className="text-primary">Sultan & Terverifikasi</span>
          </h1>
          <p className="text-muted-foreground text-xs leading-relaxed sm:text-base">
            Platform jual beli akun game Sultan dengan sistem Rekber resmi Feryshop. Transaksi aman
            dikawal admin 24/7, garansi uang kembali, dan proses serah terima instan.
          </p>
        </div>

        {/* Search Bar Shortcut - Minimalist without icons */}
        <form onSubmit={handleSearch} className="flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Cari akun impian (mis: Mythic Glory)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border bg-background/80 focus-visible:ring-primary h-9 rounded-lg px-3 text-xs shadow-sm backdrop-blur-sm sm:h-12 sm:rounded-xl sm:px-4 sm:text-sm"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="h-9 rounded-lg px-4 text-xs font-semibold shadow-md sm:h-12 sm:rounded-xl sm:px-6 sm:text-sm"
          >
            <span>Cari Akun</span>
          </Button>
        </form>

        {/* Quick Value Props Grid - Minimalist Text Only */}
        <div className="border-border/40 grid w-full grid-cols-3 gap-1.5 border-t pt-3 sm:gap-6 sm:pt-4">
          <div className="bg-muted/30 border-border/40 flex flex-col justify-center rounded-xl border p-2 text-center sm:rounded-2xl sm:p-3">
            <div className="text-foreground truncate text-[11px] font-bold leading-tight sm:text-xs">
              Rekber Resmi
            </div>
            <div className="text-muted-foreground mt-0.5 truncate text-[9px] leading-tight sm:text-[11px]">
              Kawalan Admin 24/7
            </div>
          </div>

          <div className="bg-muted/30 border-border/40 flex flex-col justify-center rounded-xl border p-2 text-center sm:rounded-2xl sm:p-3">
            <div className="text-foreground truncate text-[11px] font-bold leading-tight sm:text-xs">
              Akun Verified
            </div>
            <div className="text-muted-foreground mt-0.5 truncate text-[9px] leading-tight sm:text-[11px]">
              Seleksi Seller Ketat
            </div>
          </div>

          <div className="bg-muted/30 border-border/40 flex flex-col justify-center rounded-xl border p-2 text-center sm:rounded-2xl sm:p-3">
            <div className="text-foreground truncate text-[11px] font-bold leading-tight sm:text-xs">
              Serah Instan
            </div>
            <div className="text-muted-foreground mt-0.5 truncate text-[9px] leading-tight sm:text-[11px]">
              &lt; 5 Menit Cair
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
