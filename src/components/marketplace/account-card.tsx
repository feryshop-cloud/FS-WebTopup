"use client";

import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Zap, Flame, Award } from "lucide-react";
import type { GameAccount } from "@/lib/data/mock-marketplace";
import { cn, resolveStorageUrl } from "@/lib/utils";

export function AccountCard({ account }: { account: GameAccount }) {
  const discountPercentage = account.originalPrice
    ? Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)
    : 0;

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case "Sultan":
        return "bg-amber-500/90 text-black font-extrabold border-amber-300 shadow-amber-500/20";
      case "Hot Deal":
        return "bg-rose-500/90 text-white font-bold border-rose-300 shadow-rose-500/20";
      case "Fast Delivery":
        return "bg-brand-blue text-brand-blue-foreground font-bold border-cyan-200 shadow-brand-blue/20";
      case "Rare Item":
        return "bg-purple-500/90 text-white font-bold border-purple-300 shadow-purple-500/20";
      default:
        return "bg-primary/90 text-primary-foreground font-bold border-primary/40";
    }
  };

  return (
    <Link
      href={`/marketplace/${account.gameSlug}/${account.id}`}
      className="border-border/70 bg-card hover:border-primary/50 focus-visible:ring-primary focus-visible:ring-offset-background group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      {/* Thumbnail Section */}
      <div className="bg-muted/60 relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={resolveStorageUrl(account.images[0])}
          alt={account.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Top Badges */}
        <div className="absolute left-2 right-2 top-2 sm:left-2.5 sm:right-2.5 sm:top-2.5 flex items-center justify-between gap-1.5">
          {account.badge ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md sm:rounded-lg border px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] tracking-wide shadow-md backdrop-blur-sm",
                getBadgeStyle(account.badge),
              )}
            >
              {account.badge === "Sultan" && <Award className="h-3 w-3 shrink-0" />}
              {account.badge === "Hot Deal" && <Flame className="h-3 w-3 shrink-0" />}
              {account.badge === "Fast Delivery" && <Zap className="h-3 w-3 shrink-0" />}
              <span className="truncate">{account.badge}</span>
            </span>
          ) : (
            <span />
          )}

          {discountPercentage > 0 && (
            <span className="rounded-md sm:rounded-lg bg-red-600 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold text-white shadow-md">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Rank & Login Via */}
        <div className="absolute bottom-2 left-2 right-2 sm:left-2.5 sm:right-2.5 flex items-center justify-between gap-1 text-[10px] sm:text-[11px] font-semibold text-white/95">
          <span className="flex max-w-[55%] items-center gap-1 truncate rounded-md border border-white/10 bg-black/70 px-1.5 py-0.5 sm:px-2 backdrop-blur-md">
            <ShieldCheck className="inline h-3 w-3 shrink-0 text-emerald-400" />
            <span className="truncate">{account.specs.rank}</span>
          </span>
          <span className="max-w-[42%] truncate rounded-md border border-white/10 bg-black/70 px-1.5 py-0.5 sm:px-2 text-zinc-300 backdrop-blur-md">
            {account.specs.loginVia}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between gap-1.5 p-2.5 sm:gap-2 sm:p-3.5">
        <div className="space-y-1">
          {/* Game label */}
          <span className="text-primary text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
            {account.gameName}
          </span>

          {/* Account Title */}
          <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-xs sm:text-sm font-bold leading-tight sm:leading-snug transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
            {account.title}
          </h3>
        </div>

        {/* Price */}
        <div className="border-border/40 mt-1 flex flex-col xs:flex-row xs:items-baseline xs:gap-1.5 border-t pt-1.5 sm:pt-2">
          {account.originalPrice && (
            <span className="text-muted-foreground text-[9px] sm:text-[10px] font-medium line-through">
              Rp {account.originalPrice.toLocaleString("id-ID")}
            </span>
          )}
          <span className="text-xs sm:text-base font-extrabold text-emerald-500">
            Rp {account.price.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </Link>
  );
}
