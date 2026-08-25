"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { AccountCard } from "@/components/marketplace/account-card";
import { Button } from "@/components/ui/button";
import type { GameAccount, GameCategory } from "@/lib/data/mock-marketplace";

export function FeaturedAccounts({
  accounts,
}: {
  accounts: GameAccount[];
  categories?: GameCategory[];
}) {
  const featured = accounts
    .filter((account) => account.isFeatured || account.badge === "Sultan")
    .slice(0, 10);

  const displayAccounts = featured.length > 0 ? featured : accounts.slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Katalog Akun Pilihan - Kartu akun sultan siap beli */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <span className="bg-primary/10 text-primary border-primary/20 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            Sultan Picks
          </span>
          <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
            Katalog Akun Pilihan
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Akun sultan terlaris siap beli dengan garansi anti-hack & rekber resmi Feryshop
          </p>
        </div>
        <Button asChild variant="outline" className="gap-2 self-start rounded-xl sm:self-auto">
          <Link href="/marketplace">
            Lihat Semua Akun
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {displayAccounts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayAccounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        <div className="border-border bg-muted/30 rounded-xl border p-6 text-center">
          <div className="text-sm font-medium">Belum ada akun tersedia</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Silakan periksa kembali nanti atau hubungi CS kami.
          </div>
        </div>
      )}
    </div>
  );
}
