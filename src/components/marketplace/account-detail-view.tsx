"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  Star,
  CheckCircle2,
  Award,
  Zap,
  Lock,
  Clock,
  Sparkles,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameAccount } from "@/lib/data/mock-marketplace";
import { cn, resolveStorageUrl } from "@/lib/utils";

export function MarketplaceAccountDetailView({ account }: { account: GameAccount }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const discountPercentage = account.originalPrice
    ? Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)
    : 0;

  // WhatsApp pre-filled messages
  const adminPhone = "6281234567890"; // Admin Feryshop Rekber WhatsApp
  const tanyaMessage = encodeURIComponent(
    `Halo Admin Feryshop, saya ingin bertanya tentang akun game berikut:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\n\nApakah akun ini masih tersedia dan ready Rekber?`,
  );
  const beliMessage = encodeURIComponent(
    `Halo Admin Feryshop, saya ingin MEMBELI akun game melalui Rekber resmi Feryshop:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\nPenjual: ${account.seller.name}\n\nMohon instruksi pembayaran dan proses serah terima datanya Admin.`,
  );

  const whatsappTanyaUrl = `https://wa.me/${adminPhone}?text=${tanyaMessage}`;
  const whatsappBeliUrl = `https://wa.me/${adminPhone}?text=${beliMessage}`;

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
        <Link href="/marketplace" className="hover:text-primary font-medium transition-colors">
          Daftar Akun
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/marketplace/${account.gameSlug}`}
          className="hover:text-primary font-medium transition-colors"
        >
          {account.gameName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground max-w-[200px] truncate font-semibold sm:max-w-md">
          {account.title}
        </span>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: Image Gallery & Specs */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Image Gallery */}
          <div className="space-y-3">
            <div className="border-border/80 bg-muted/60 relative aspect-[16/10] w-full overflow-hidden rounded-3xl border shadow-lg">
              <Image
                src={resolveStorageUrl(account.images[selectedImageIndex])}
                alt={account.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Top Badges */}
              <div className="absolute left-4 top-4 flex items-center gap-2">
                {account.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-extrabold text-black shadow-lg">
                    <Award className="h-4 w-4" />
                    {account.badge}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                    Diskon {discountPercentage}%
                  </span>
                )}
              </div>

              {/* Bottom Security Guarantee Tag */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-bold text-white">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/70 px-3 py-1.5 backdrop-blur-md">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  100% Anti-Hack & All Monsep
                </span>
                <span className="bg-primary/90 text-primary-foreground rounded-xl px-3 py-1.5">
                  ID: #{account.id.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Thumbnails if multiple images */}
            {account.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {account.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:w-32",
                      selectedImageIndex === idx
                        ? "border-primary ring-primary/30 scale-105 shadow-md ring-2"
                        : "border-border/50 opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={resolveStorageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Title & Basic Info (Mobile view prominent) */}
          <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
                <Zap className="h-3.5 w-3.5" /> {account.specs.deliveryType}
              </span>
              <span className="text-muted-foreground flex items-center gap-1 text-xs font-semibold">
                <Clock className="h-3.5 w-3.5" />
                Diposting {account.createdAt}
              </span>
            </div>

            <h1 className="text-foreground text-xl font-extrabold leading-snug sm:text-2xl">
              {account.title}
            </h1>

            {/* Price Badge for Mobile */}
            <div className="border-border/50 flex items-baseline gap-3 border-t pt-2 lg:hidden">
              <span className="text-2xl font-extrabold text-emerald-500">
                Rp {account.price.toLocaleString("id-ID")}
              </span>
              {account.originalPrice && (
                <span className="text-muted-foreground text-sm font-semibold line-through">
                  Rp {account.originalPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <Sparkles className="text-primary h-4 w-4" /> Spesifikasi Akun Utama
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="bg-muted/50 border-border/40 space-y-1 rounded-2xl border p-3.5">
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Rank Utama
                </span>
                <span className="text-foreground block truncate text-xs font-extrabold sm:text-sm">
                  {account.specs.rank}
                </span>
              </div>
              <div className="bg-muted/50 border-border/40 space-y-1 rounded-2xl border p-3.5">
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Jumlah Skin
                </span>
                <span className="text-foreground block truncate text-xs font-extrabold sm:text-sm">
                  {account.specs.skinsCount}
                </span>
              </div>
              <div className="bg-muted/50 border-border/40 space-y-1 rounded-2xl border p-3.5">
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Metode Login
                </span>
                <span className="text-primary block truncate text-xs font-extrabold sm:text-sm">
                  {account.specs.loginVia}
                </span>
              </div>
              <div className="bg-muted/50 border-border/40 space-y-1 rounded-2xl border p-3.5">
                <span className="text-muted-foreground block text-[11px] font-semibold">
                  Ganti Nama (CN)
                </span>
                <span className="text-foreground block truncate text-xs font-extrabold sm:text-sm">
                  {account.specs.changeName}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Account Description */}
          <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Detail Deskripsi & Kelengkapan
            </h2>

            <ul className="text-muted-foreground space-y-2.5 text-xs leading-relaxed sm:text-sm">
              {account.description.map((desc, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="bg-primary mt-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Purchasing Card & Seller Info */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
          {/* Main Price & Purchase CTA Box */}
          <div className="border-primary/30 bg-card relative space-y-6 overflow-hidden rounded-3xl border p-6 shadow-xl">
            {/* Background Glow */}
            <div className="bg-primary/10 pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl" />

            <div className="space-y-2">
              <span className="text-muted-foreground block text-xs font-bold uppercase tracking-wider">
                Harga Pas Rekber
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-500 sm:text-3xl">
                  Rp {account.price.toLocaleString("id-ID")}
                </span>
                {account.originalPrice && (
                  <span className="text-muted-foreground text-xs font-semibold line-through sm:text-sm">
                    Rp {account.originalPrice.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                asChild
                size="lg"
                className="h-12 w-full gap-2 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500"
              >
                <a href={whatsappBeliUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
                  Beli via Rekber WhatsApp
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-background hover:bg-muted h-11 w-full gap-2 rounded-2xl text-xs font-bold sm:text-sm"
              >
                <a href={whatsappTanyaUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="text-primary h-4 w-4" />
                  Tanya Stok & Detail
                </a>
              </Button>
            </div>

            {/* Transaction Security Guarantees */}
            <div className="border-border/60 text-muted-foreground space-y-2.5 border-t pt-4 text-xs">
              <div className="text-foreground flex items-center gap-2 font-semibold">
                <Lock className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Transaksi 100% Aman via Rekber Feryshop</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="text-primary h-4 w-4 shrink-0" />
                <span>Garansi Penggantian / Anti-Hack</span>
              </div>
            </div>
          </div>

          {/* Seller Profile Box */}
          <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-5 shadow-sm">
            <span className="text-muted-foreground block text-xs font-bold uppercase tracking-wider">
              Informasi Penjual
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary border-primary/20 flex h-10 w-10 items-center justify-center rounded-2xl border font-black">
                  {account.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground text-sm font-bold">{account.seller.name}</span>
                    {account.seller.isVerified && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{account.seller.rating}</span>
                    <span className="text-muted-foreground">
                      ({account.seller.salesCount} Transaksi Sukses)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
