"use client";

import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Flame, Crosshair, Trophy, Shield, Sparkles, ChevronRight } from "lucide-react";
import { MARKETPLACE_CATEGORIES, type GameCategory } from "@/lib/data/mock-marketplace";
import { cn, resolveStorageUrl } from "@/lib/utils";

export function GameCategoryIcon({
  iconName,
  className,
}: {
  iconName: GameCategory["iconName"];
  className?: string;
}) {
  switch (iconName) {
    case "mlbb":
      return <Gamepad2 className={cn("text-tertiary", className)} />;
    case "ff":
      return <Flame className={cn("text-primary", className)} />;
    case "valorant":
      return <Crosshair className={cn("text-rose-500", className)} />;
    case "efootball":
      return <Trophy className={cn("text-info", className)} />;
    case "pubgm":
      return <Shield className={cn("text-amber-500", className)} />;
    case "genshin":
      return <Sparkles className={cn("text-sky-400", className)} />;
    default:
      return <Gamepad2 className={className} />;
  }
}

export function MarketplaceCategoryGrid({
  categories = MARKETPLACE_CATEGORIES,
}: {
  categories?: GameCategory[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            Katalog Akun Game Populer
          </h2>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Klik kategori di bawah untuk melihat daftar akun sultan yang tersedia
        </p>
      </div>

      {/* Grid Kategori (Mobile 2 kolom, Tablet 3 kolom, Desktop 5 kolom) */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/marketplace/${category.slug}`}
            className="border-border/70 bg-card hover:border-primary/50 focus-visible:ring-primary group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 sm:rounded-2xl sm:p-4"
          >
            {/* Background Glow on Hover */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                category.colorTheme,
              )}
            />

            <div>
              {/* Top Bar with Icon & Badge */}
              <div className="mb-2 flex items-center justify-between sm:mb-3">
                <div className="bg-muted/60 border-border/50 relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border shadow-sm transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12 sm:rounded-xl">
                  <Image
                    src={resolveStorageUrl(category.bannerUrl)}
                    alt={`${category.name} icon`}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain p-1"
                  />
                </div>
                <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold">
                  {category.totalAccounts} Akun
                </span>
              </div>

              {/* Game Name & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-foreground group-hover:text-primary text-sm font-bold transition-colors sm:text-base">
                  {category.name}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {category.subtitle}
                </p>
              </div>
            </div>

            {/* Bottom Action Hint */}
            <div className="border-border/40 text-muted-foreground group-hover:text-primary mt-4 flex items-center justify-between border-t pt-3 text-xs font-semibold transition-colors">
              <span>Lihat Katalog</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
