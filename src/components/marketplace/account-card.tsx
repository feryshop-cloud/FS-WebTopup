"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Zap, Flame, Award, CheckCircle2, ChevronRight } from "lucide-react";
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
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* Thumbnail Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/60">
        <Image
          src={resolveStorageUrl(account.images[0])}
          alt={account.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
          {account.badge ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] tracking-wide shadow-md backdrop-blur-sm",
                getBadgeStyle(account.badge)
              )}
            >
              {account.badge === "Sultan" && <Award className="h-3 w-3" />}
              {account.badge === "Hot Deal" && <Flame className="h-3 w-3" />}
              {account.badge === "Fast Delivery" && <Zap className="h-3 w-3" />}
              {account.badge}
            </span>
          ) : (
            <span />
          )}

          {discountPercentage > 0 && (
            <span className="rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Bottom Image Overlay: Rank & Login Via */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-white/90">
          <span className="truncate bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400 inline" /> {account.specs.rank}
          </span>
          <span className="truncate bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-muted-foreground">
            {account.specs.loginVia}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4 space-y-3">
        <div>
          {/* Game Category Label */}
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
            <span className="text-primary font-bold">{account.gameName}</span>
            <span className="text-[10px] text-muted-foreground">{account.specs.deliveryType}</span>
          </div>

          {/* Account Title */}
          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
            {account.title}
          </h3>
        </div>

        {/* Specifications Pills */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          <span className="rounded-md bg-muted/80 px-2 py-0.5 text-muted-foreground border border-border/50">
            Skin: {account.specs.skinsCount}
          </span>
          <span className="rounded-md bg-muted/80 px-2 py-0.5 text-muted-foreground border border-border/50">
            CN: {account.specs.changeName}
          </span>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-border/50 flex items-end justify-between">
          <div>
            {account.originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through block font-medium">
                Rp {account.originalPrice.toLocaleString("id-ID")}
              </span>
            )}
            <span className="text-sm sm:text-base font-extrabold text-emerald-500">
              Rp {account.price.toLocaleString("id-ID")}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
            Beli <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
