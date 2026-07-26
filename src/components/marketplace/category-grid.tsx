"use client";

import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Flame, Crosshair, Trophy, Shield, ChevronRight } from "lucide-react";
import { MARKETPLACE_CATEGORIES, type GameCategory } from "@/lib/data/mock-marketplace";
import { cn } from "@/lib/utils";

export function GameCategoryIcon({ iconName, className }: { iconName: GameCategory["iconName"]; className?: string }) {
  switch (iconName) {
    case "mlbb":
      return <Gamepad2 className={cn("text-indigo-500", className)} />;
    case "ff":
      return <Flame className={cn("text-orange-500", className)} />;
    case "valorant":
      return <Crosshair className={cn("text-rose-500", className)} />;
    case "efootball":
      return <Trophy className={cn("text-blue-500", className)} />;
    case "pubgm":
      return <Shield className={cn("text-amber-500", className)} />;
    default:
      return <Gamepad2 className={className} />;
  }
}

export function MarketplaceCategoryGrid() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Katalog Akun Game Populer
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Klik kategori di bawah untuk melihat daftar akun sultan yang tersedia
        </p>
      </div>

      {/* Grid Kategori (Mobile 2 kolom, Tablet 3 kolom, Desktop 5 kolom) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-x-6 sm:gap-y-6">
        {MARKETPLACE_CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/marketplace/${category.slug}`}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/70 bg-card p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col justify-between"
          >
            {/* Background Glow on Hover */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-b pointer-events-none",
                category.colorTheme
              )}
            />

            <div>
              {/* Top Bar with Icon & Badge */}
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-muted/60 border border-border/50 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <GameCategoryIcon iconName={category.iconName} className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                  {category.totalAccounts} Akun
                </span>
              </div>

              {/* Game Name & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {category.subtitle}
                </p>
              </div>
            </div>

            {/* Bottom Action Hint */}
            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              <span>Lihat Katalog</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
