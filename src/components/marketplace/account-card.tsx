"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Zap, Flame, Award, CheckCircle2, ChevronRight } from "lucide-react";
import type { GameAccount } from "@/lib/data/mock-marketplace";
import { cn } from "@/lib/utils";

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
        return "bg-emerald-500/90 text-white font-bold border-emerald-300 shadow-emerald-500/20";
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
          src={account.images[0] || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop"}
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
          <span className="truncate bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            🛡️ {account.specs.rank}
          </span>
          <span className="text-[10px] bg-primary/80 text-primary-foreground px-2 py-0.5 rounded-md font-bold">
            {account.specs.loginVia}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {account.title}
          </h3>

          {/* Quick Specs Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/50">
              💎 {account.specs.skinsCount} Skin
            </span>
            {account.specs.winrate && (
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/50">
                🔥 WR {account.specs.winrate}
              </span>
            )}
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/50">
              ⚡ {account.specs.deliveryType.split(" ")[0]}
            </span>
          </div>
        </div>

        {/* Price & Seller Footer */}
        <div className="pt-3 border-t border-border/40 space-y-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Harga Akun</div>
              <div className="text-base sm:text-lg font-extrabold text-primary">
                Rp {account.price.toLocaleString("id-ID")}
              </div>
            </div>
            {account.originalPrice && (
              <div className="text-right">
                <div className="text-[11px] text-muted-foreground line-through">
                  Rp {account.originalPrice.toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-emerald-500 font-bold">Hemat Rp {(account.originalPrice - account.price).toLocaleString("id-ID")}</div>
              </div>
            )}
          </div>

          {/* Seller Bar */}
          <div className="flex items-center justify-between bg-muted/30 rounded-xl p-2 border border-border/40 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                {account.seller.name.charAt(0)}
              </div>
              <span className="font-semibold text-foreground truncate text-[11px]">{account.seller.name}</span>
              {account.seller.isVerified && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-1 shrink-0 text-[11px] font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>{account.seller.rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
