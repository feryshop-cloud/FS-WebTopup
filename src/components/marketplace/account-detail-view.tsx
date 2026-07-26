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
import { MOCK_ACCOUNTS, type GameAccount } from "@/lib/data/mock-marketplace";
import { cn } from "@/lib/utils";

export function MarketplaceAccountDetailView({ accountId }: { accountId: string }) {
  const account = MOCK_ACCOUNTS.find((acc) => acc.id === accountId || acc.slug === accountId) || MOCK_ACCOUNTS[0];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const discountPercentage = account.originalPrice
    ? Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)
    : 0;

  // WhatsApp pre-filled messages
  const adminPhone = "6281234567890"; // Admin TopupSon Rekber WhatsApp
  const tanyaMessage = encodeURIComponent(
    `Halo Admin TopupSon, saya ingin bertanya tentang akun game berikut:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\n\nApakah akun ini masih tersedia dan ready Rekber?`
  );
  const beliMessage = encodeURIComponent(
    `Halo Admin TopupSon, saya ingin MEMBELI akun game melalui Rekber resmi TopupSon:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\nPenjual: ${account.seller.name}\n\nMohon instruksi pembayaran dan proses serah terima datanya Admin.`
  );

  const whatsappTanyaUrl = `https://wa.me/${adminPhone}?text=${tanyaMessage}`;
  const whatsappBeliUrl = `https://wa.me/${adminPhone}?text=${beliMessage}`;

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-muted-foreground">
        <Link href="/marketplace" className="hover:text-primary transition-colors font-medium">
          Katalog Akun
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
                src={account.images[selectedImageIndex] || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"}
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
                    <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account Title & Basic Info (Mobile view prominent) */}
          <div className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20">
                ⚡ {account.specs.deliveryType}
              </span>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Diposting {account.createdAt}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-snug">
              {account.title}
            </h1>

            {/* Price Box for Mobile (hidden on desktop sidebar) */}
            <div className="lg:hidden rounded-2xl bg-muted/40 p-4 border border-border/60 space-y-2">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Harga Rekber Resmi</div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-primary">
                  Rp {account.price.toLocaleString("id-ID")}
                </div>
                {account.originalPrice && (
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground line-through block">
                      Rp {account.originalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="text-xs text-emerald-500 font-bold">
                      Hemat Rp {(account.originalPrice - account.price).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Specification Grid */}
            <div className="space-y-3 pt-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Spesifikasi & Detail Akun
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground font-semibold">Rank Saat Ini</div>
                  <div className="text-sm font-extrabold text-foreground">{account.specs.rank}</div>
                </div>

                {account.specs.level && (
                  <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground font-semibold">Level Akun / Squad</div>
                    <div className="text-sm font-extrabold text-foreground">{account.specs.level}</div>
                  </div>
                )}

                <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground font-semibold">Total Skin / Item</div>
                  <div className="text-sm font-extrabold text-primary">{account.specs.skinsCount} Skin</div>
                </div>

                {account.specs.heroesCount && (
                  <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground font-semibold">Total Hero / Karakter</div>
                    <div className="text-sm font-extrabold text-foreground">{account.specs.heroesCount}</div>
                  </div>
                )}

                <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                  <div className="text-[11px] text-muted-foreground font-semibold">Tipe Login / Bind</div>
                  <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{account.specs.loginVia}</div>
                </div>

                {account.specs.changeName && (
                  <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground font-semibold">Status Change Name</div>
                    <div className="text-sm font-extrabold text-foreground">{account.specs.changeName}</div>
                  </div>
                )}

                {account.specs.winrate && (
                  <div className="rounded-2xl bg-muted/30 p-3.5 border border-border/50 space-y-1">
                    <div className="text-[11px] text-muted-foreground font-semibold">Winrate / KD Ratio</div>
                    <div className="text-sm font-extrabold text-amber-500">{account.specs.winrate}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Deskripsi & Catatan Keamanan Akun
            </h2>

            <div className="space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {account.description.map((desc, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{desc}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-primary/5 border border-primary/20 p-4 text-xs space-y-1.5 text-foreground">
              <div className="font-bold flex items-center gap-1.5 text-primary">
                <ShieldCheck className="h-4 w-4" />
                Garansi Resmi Rekber TopupSon
              </div>
              <p className="text-muted-foreground leading-normal">
                Dana pembelian kamu tidak akan diserahkan kepada penjual sebelum kamu berhasil login dan memverifikasi seluruh item akun sesuai spesifikasi di atas. Jika terjadi kendala data atau hack-back, dana dikembalikan 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop Sidebar / Checkout Box) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Main Checkout Card (Desktop) */}
          <div className="hidden lg:block rounded-3xl border border-primary/30 bg-gradient-to-b from-card via-card to-primary/5 p-6 shadow-xl space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Harga Akun</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">
                  Rp {account.price.toLocaleString("id-ID")}
                </span>
              </div>
              {account.originalPrice && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="text-muted-foreground line-through">
                    Rp {account.originalPrice.toLocaleString("id-ID")}
                  </span>
                  <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Hemat Rp {(account.originalPrice - account.price).toLocaleString("id-ID")}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <Button
                asChild
                className="w-full h-12 rounded-xl text-sm font-extrabold gap-2.5 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <a href={whatsappBeliUrl} target="_blank" rel="noopener noreferrer">
                  <ShieldCheck className="h-5 w-5" />
                  Beli Sekarang (Rekber Resmi)
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-xl text-sm font-bold gap-2.5 border-border hover:bg-muted/80 text-foreground"
              >
                <a href={whatsappTanyaUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 text-emerald-500" />
                  Tanya Admin via WhatsApp
                </a>
              </Button>
            </div>

            {/* Guarantee Pills */}
            <div className="pt-4 border-t border-border/50 space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Transaksi Aman Kawalan Admin 24/7</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Garansi Uang Kembali 100%</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Serah Terima Data Tercepat (&lt; 5 Menit)</span>
              </div>
            </div>
          </div>

          {/* Seller Profile Box */}
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Informasi Penjual</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <UserCheck className="h-3 w-3" />
                Verified Seller
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary font-black text-xl shadow-inner">
                {account.seller.name.charAt(0)}
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-foreground text-base truncate">{account.seller.name}</h3>
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    {account.seller.rating}
                  </span>
                  <span>•</span>
                  <span>{account.seller.salesCount} Terjual</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40 text-center space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-semibold">Respon Chat</div>
                <div className="font-bold text-foreground">{account.seller.responseTime}</div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40 text-center space-y-0.5">
                <div className="text-[10px] text-muted-foreground font-semibold">Status KTP & Resi</div>
                <div className="font-bold text-emerald-500">100% Terverifikasi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM CTA BAR (Only visible on screens < lg) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-md p-3 sm:p-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground font-bold uppercase truncate">Harga Rekber</div>
            <div className="text-base sm:text-lg font-black text-primary truncate">
              Rp {account.price.toLocaleString("id-ID")}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-border bg-card shadow-sm"
              title="Tanya Admin via WhatsApp"
            >
              <a href={whatsappTanyaUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 text-emerald-500" />
              </a>
            </Button>

            <Button
              asChild
              className="h-11 px-5 rounded-xl text-xs sm:text-sm font-extrabold gap-2 shadow-lg bg-primary text-primary-foreground"
            >
              <a href={whatsappBeliUrl} target="_blank" rel="noopener noreferrer">
                <ShieldCheck className="h-4 w-4" />
                <span>Beli Sekarang</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
