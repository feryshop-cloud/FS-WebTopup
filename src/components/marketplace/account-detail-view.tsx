"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  MessageCircle,
  Star,
  CheckCircle2,
  Award,
  Zap,
  Lock,
  Clock,
  Sparkles,
  Share2,
  AlertCircle,
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
    `Halo Admin Feryshop, saya ingin bertanya tentang akun game berikut:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\n\nApakah akun ini masih tersedia dan ready Rekber?`
  );
  const beliMessage = encodeURIComponent(
    `Halo Admin Feryshop, saya ingin MEMBELI akun game melalui Rekber resmi Feryshop:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\nPenjual: ${account.seller.name}\n\nMohon instruksi pembayaran dan proses serah terima datanya Admin.`
  );

  const whatsappTanyaUrl = `https://wa.me/${adminPhone}?text=${tanyaMessage}`;
  const whatsappBeliUrl = `https://wa.me/${adminPhone}?text=${beliMessage}`;

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:text-primary transition-colors font-medium">
          Daftar Akun
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/marketplace/${account.gameSlug}`} className="hover:text-primary transition-colors font-medium">
          {account.gameName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">{account.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery & Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-border/80 bg-muted/60 shadow-lg">
              <Image
                src={resolveStorageUrl(account.images[selectedImageIndex])}
                alt={account.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
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
                <span className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  100% Anti-Hack & All Monsep
                </span>
                <span className="bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-xl">
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
                      "relative aspect-[16/10] w-24 sm:w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      selectedImageIndex === idx ? "border-primary ring-2 ring-primary/30 scale-105 shadow-md" : "border-border/50 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image src={resolveStorageUrl(img)} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Title & Basic Info (Mobile view prominent) */}
          <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                <Zap className="h-3.5 w-3.5" /> {account.specs.deliveryType}
              </span>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Diposting {account.createdAt}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-snug">
              {account.title}
            </h1>

            {/* Price Badge for Mobile */}
            <div className="flex items-baseline gap-3 pt-2 lg:hidden border-t border-border/50">
              <span className="text-2xl font-extrabold text-emerald-500">
                Rp {account.price.toLocaleString("id-ID")}
              </span>
              {account.originalPrice && (
                <span className="text-sm text-muted-foreground line-through font-semibold">
                  Rp {account.originalPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Spesifikasi Akun Utama
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-muted/50 p-3.5 border border-border/40 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">Rank Utama</span>
                <span className="text-xs sm:text-sm font-extrabold text-foreground block truncate">{account.specs.rank}</span>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3.5 border border-border/40 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">Jumlah Skin</span>
                <span className="text-xs sm:text-sm font-extrabold text-foreground block truncate">{account.specs.skinsCount}</span>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3.5 border border-border/40 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">Metode Login</span>
                <span className="text-xs sm:text-sm font-extrabold text-primary block truncate">{account.specs.loginVia}</span>
              </div>
              <div className="rounded-2xl bg-muted/50 p-3.5 border border-border/40 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground block">Ganti Nama (CN)</span>
                <span className="text-xs sm:text-sm font-extrabold text-foreground block truncate">{account.specs.changeName}</span>
              </div>
            </div>
          </div>

          {/* Detailed Account Description */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Detail Deskripsi & Kelengkapan
            </h2>

            <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {account.description.map((desc, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Sticky Purchasing Card & Seller Info */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Main Price & Purchase CTA Box */}
          <div className="rounded-3xl border border-primary/30 bg-card p-6 space-y-6 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Harga Pas Rekber</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-500">
                  Rp {account.price.toLocaleString("id-ID")}
                </span>
                {account.originalPrice && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through font-semibold">
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
                className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 gap-2"
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
                className="w-full h-11 rounded-2xl border-border bg-background hover:bg-muted font-bold text-xs sm:text-sm gap-2"
              >
                <a href={whatsappTanyaUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Tanya Stok & Detail
                </a>
              </Button>
            </div>

            {/* Transaction Security Guarantees */}
            <div className="pt-4 border-t border-border/60 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Lock className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Transaksi 100% Aman via Rekber Feryshop</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Garansi Penggantian / Anti-Hack</span>
              </div>
            </div>
          </div>

          {/* Seller Profile Box */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 space-y-4 shadow-sm">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Informasi Penjual</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-black border border-primary/20">
                  {account.seller.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-foreground">{account.seller.name}</span>
                    {account.seller.isVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{account.seller.rating}</span>
                    <span className="text-muted-foreground">({account.seller.salesCount} Transaksi Sukses)</span>
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
