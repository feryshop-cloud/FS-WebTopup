"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  Star,
  CheckCircle2,
  Award,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  X,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameAccount } from "@/lib/data/mock-marketplace";
import { useSettings } from "@/context/settings-context";
import { cn, resolveStorageUrl } from "@/lib/utils";

const toString = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));

export function MarketplaceAccountDetailView({ account }: { account: GameAccount }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [whatsappFailed, setWhatsappFailed] = useState(false);
  const [caraBeliOpen, setCaraBeliOpen] = useState(false);
  const settings = useSettings();
  const data = settings?.data ?? {};

  const totalImages = account.images.length;

  const handlePrevImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  }, [totalImages]);

  const handleNextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  }, [totalImages]);

  // Keyboard navigation for gallery & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrevImage, handleNextImage]);

  const discountPercentage = account.originalPrice
    ? Math.round(((account.originalPrice - account.price) / account.originalPrice) * 100)
    : 0;

  // Dashboard-controllable texts & WhatsApp contact (fallbacks to seed defaults)
  const brandName = toString(data["marketplace.brand_name"] || "Feryshop");
  const adminPhone = toString(data["marketplace.admin_whatsapp"] || "6281234567890");
  const antiHackBadge = toString(
    data["marketplace.anti_hack_badge"] || "100% Anti-Hack & All Monsep",
  );
  const priceLabel = toString(data["marketplace.price_label"] || "Harga Pas Rekber");
  const sellerInfoLabel = toString(data["marketplace.seller_info_label"] || "Informasi Penjual");
  const specsTitle = toString(data["marketplace.specs_title"] || "Spesifikasi Akun Utama");
  const descriptionTitle = toString(
    data["marketplace.description_title"] || "Detail Deskripsi & Kelengkapan",
  );
  const listedLabel = toString(data["marketplace.listed_label"] || "Diposting");
  const discountLabel = toString(data["marketplace.discount_label"] || "Diskon");

  // WhatsApp pre-filled messages
  const tanyaMessage = encodeURIComponent(
    `Halo Admin ${brandName}, saya ingin bertanya tentang akun game berikut:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\n\nApakah akun ini masih tersedia dan ready Rekber?`,
  );
  const beliMessage = encodeURIComponent(
    `Halo Admin ${brandName}, saya ingin MEMBELI akun game melalui Rekber resmi ${brandName}:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga: Rp ${account.price.toLocaleString("id-ID")}\nPenjual: ${account.seller.name}\n\nMohon instruksi pembayaran dan proses serah terima datanya Admin.`,
  );
  const negoMessage = encodeURIComponent(
    `Halo Admin ${brandName}, saya tertarik dengan akun ini tapi ingin NEGO HARGA dulu ya:\n\n*${account.title}*\nID Akun: ${account.id}\nHarga Listed: Rp ${account.price.toLocaleString("id-ID")}\n\nApakah ada ruang nego? Terima kasih.`,
  );

  const whatsappTanyaUrl = `https://wa.me/${adminPhone}?text=${tanyaMessage}`;
  const whatsappBeliUrl = `https://wa.me/${adminPhone}?text=${beliMessage}`;
  const whatsappNegoUrl = `https://wa.me/${adminPhone}?text=${negoMessage}`;

  const handleWhatsAppClick = useCallback(
    (url: string) => {
      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
        setWhatsappFailed(true);
      }
    },
    [],
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
        <Link href="/marketplace" className="hover:text-primary font-medium transition-colors">
          Daftar Akun
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <Link
          href={`/marketplace/${account.gameSlug}`}
          className="hover:text-primary font-medium transition-colors"
        >
          {account.gameName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <span className="text-foreground max-w-[200px] truncate font-semibold sm:max-w-md">
          {account.title}
        </span>
      </nav>

      {/* Main Account Title & Badges Header */}
      <div className="border-border/60 bg-card/60 space-y-3 rounded-2xl border p-4 sm:p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            {account.specs.deliveryType}
          </span>
          <span className="bg-muted text-muted-foreground border-border/60 rounded-full border px-3 py-1 font-mono text-xs font-semibold">
            ID: #{account.id.toUpperCase()}
          </span>
          <span className="text-muted-foreground ml-auto flex items-center gap-1.5 text-xs font-medium">
            <Clock className="h-3.5 w-3.5" />
            {listedLabel} {account.createdAt}
          </span>
        </div>

        <h1 className="text-foreground text-xl font-extrabold leading-snug tracking-tight sm:text-2xl lg:text-3xl">
          {account.title}
        </h1>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Image Gallery, Specs, and Description */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Image Gallery */}
          <div className="border-border/70 bg-card space-y-3 rounded-2xl border p-2.5 sm:p-4 shadow-sm">
            <div className="border-border/80 bg-black/90 group relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-xl sm:rounded-2xl border shadow-inner">
              {/* Blurred Ambient Background Layer */}
              <Image
                src={resolveStorageUrl(account.images[selectedImageIndex])}
                alt=""
                fill
                aria-hidden="true"
                className="pointer-events-none object-cover blur-2xl opacity-40 scale-110"
              />

              {/* Foreground Image Layer (100% visible, uncropped) */}
              <Image
                src={resolveStorageUrl(account.images[selectedImageIndex])}
                alt={account.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="relative z-10 cursor-zoom-in object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.02]"
                onClick={() => setIsLightboxOpen(true)}
              />
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Top Badges */}
              <div className="absolute left-3 top-3 z-30 flex items-center gap-2 sm:left-4 sm:top-4">
                {account.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-black shadow-lg">
                    <Award className="h-3.5 w-3.5" />
                    {account.badge}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-lg">
                    {discountLabel} -{discountPercentage}%
                  </span>
                )}
              </div>

              {/* Top Right: Photo Counter & Expand Button */}
              <div className="absolute right-3 top-3 z-30 flex items-center gap-2 sm:right-4 sm:top-4">
                {totalImages > 1 && (
                  <span className="rounded-xl border border-white/15 bg-black/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                    {selectedImageIndex + 1} / {totalImages} Foto
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="Perbesar gambar"
                  className="rounded-xl border border-white/15 bg-black/70 p-2 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/90"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              {/* Prev / Next Controls */}
              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    aria-label="Foto sebelumnya"
                    className="absolute left-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white opacity-90 backdrop-blur-md transition-all hover:bg-black/80 sm:left-4 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    aria-label="Foto berikutnya"
                    className="absolute right-3 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-2 text-white opacity-90 backdrop-blur-md transition-all hover:bg-black/80 sm:right-4 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Bottom Security Banner */}
              <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between text-xs font-bold text-white sm:bottom-4 sm:left-4 sm:right-4">
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/75 px-3 py-1.5 backdrop-blur-md">
                  <ShieldCheck className="text-primary h-4 w-4" />
                  {antiHackBadge}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {totalImages > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-1">
                {account.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "relative aspect-[16/10] w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:w-28 sm:rounded-xl",
                      selectedImageIndex === idx
                        ? "border-primary ring-primary/30 scale-105 shadow-md ring-2"
                        : "border-border/50 opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={resolveStorageUrl(img)}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Key Specifications Grid */}
          <div className="border-border/70 bg-card space-y-4 rounded-2xl border p-6 shadow-sm">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <Sparkles className="text-primary h-4 w-4" /> {specsTitle}
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

          {/* Account Detailed Description */}
          <div className="border-border/70 bg-card space-y-4 rounded-2xl border p-5 sm:p-6 shadow-sm">
            <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
              <FileText className="text-primary h-4.5 w-4.5" /> {descriptionTitle}
            </h2>

            <ul className="space-y-3 text-xs sm:text-sm">
              {account.description.map((desc, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Unified Sticky Purchase Panel & Seller Profile */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          {/* Main Purchasing & Seller Card */}
          <div className="border-primary/30 bg-card relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-xl space-y-5">
            {/* Top accent bar */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-cyan-400 to-amber-500" />

            {/* Seller Profile Header */}
            <div className="border-border/60 border-b pb-4">
              <span className="text-muted-foreground mb-3 block text-[11px] font-bold uppercase tracking-wider">
                {sellerInfoLabel}
              </span>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary border-primary/20 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-black shadow-sm">
                  {account.seller.name?.charAt(0) || "?"}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground truncate text-sm font-bold">
                      {account.seller.name}
                    </span>
                    {account.seller.isVerified && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
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

            {/* Price Box */}
            <div className="space-y-1.5">
              <span className="text-muted-foreground block text-xs font-bold uppercase tracking-wider">
                {priceLabel}
              </span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-primary text-2xl font-black sm:text-3xl">
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
            <div className="space-y-2.5 pt-1">
              {whatsappFailed ? (
                <div className="space-y-2">
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary/90 shadow-primary/25 h-12 w-full gap-2 rounded-xl text-sm font-extrabold text-white shadow-lg transition-all"
                  >
                    <button type="button" onClick={() => handleWhatsAppClick(whatsappBeliUrl)}>
                      <MessageCircle className="h-5 w-5 fill-white text-primary" />
                      Beli Akun
                    </button>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-border bg-background hover:bg-muted h-11 w-full gap-2 rounded-xl text-xs font-bold sm:text-sm"
                  >
                    <button type="button" onClick={() => handleWhatsAppClick(whatsappNegoUrl)}>
                      <MessageCircle className="text-primary h-4 w-4" />
                      Nego Harga
                    </button>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2.5">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90 shadow-primary/25 h-12 w-full gap-2 rounded-xl text-sm font-extrabold text-white shadow-lg transition-all active:scale-[0.98]"
                    >
                      <button type="button" onClick={() => handleWhatsAppClick(whatsappBeliUrl)}>
                        <MessageCircle className="h-5 w-5 fill-white text-primary" />
                        Beli Akun
                      </button>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-border bg-background hover:bg-muted h-11 w-full gap-2 rounded-xl text-xs font-bold sm:text-sm transition-all active:scale-[0.98]"
                    >
                      <button type="button" onClick={() => handleWhatsAppClick(whatsappNegoUrl)}>
                        <MessageCircle className="text-primary h-4 w-4" />
                        Nego Harga
                      </button>
                    </Button>
                  </div>
                  <a
                    href={whatsappTanyaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary block pt-1 text-center text-xs font-bold underline-offset-4 hover:underline"
                  >
                    Butuh bantuan? Tanya Admin WhatsApp
                  </a>
                </>
              )}
            </div>

            {/* How to Buy Accordion */}
            <div className="border-border/60 border-t pt-3.5">
              <button
                type="button"
                onClick={() => setCaraBeliOpen((o) => !o)}
                className="text-muted-foreground hover:text-foreground flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <span>Cara Transaksi Rekber</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    caraBeliOpen && "rotate-180",
                  )}
                />
              </button>
              {caraBeliOpen && (
                <ol className="text-muted-foreground mt-3 space-y-2 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold">
                      1
                    </span>
                    <span>Klik Beli Akun untuk terhubung langsung ke Admin WA.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold">
                      2
                    </span>
                    <span>Lakukan pembayaran via Rekber resmi {brandName}.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-primary/10 text-primary flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold">
                      3
                    </span>
                    <span>Data akun diverifikasi dan diserahterimakan 100% aman.</span>
                  </li>
                </ol>
              )}
            </div>

            {/* Security Guarantee Footer */}
            <div className="border-border/60 bg-muted/30 flex items-center justify-center gap-2 rounded-xl border p-3 text-xs">
              <ShieldCheck className="text-primary h-4.5 w-4.5 shrink-0" />
              <span className="text-foreground font-semibold">
                Rekber {brandName} — Garansi Anti-Hack
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Conversion Bar */}
      <div className="border-border bg-card/95 fixed bottom-0 left-0 right-0 z-40 border-t p-3 shadow-2xl backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-muted-foreground block text-[10px] font-bold uppercase">
              Harga Rekber
            </span>
            <span className="text-primary text-lg font-black">
              Rp {account.price.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleWhatsAppClick(whatsappBeliUrl)}
              size="sm"
              className="bg-primary hover:bg-primary/90 shadow-primary/25 h-10 gap-1.5 rounded-xl text-xs font-extrabold text-white shadow-md"
            >
              <MessageCircle className="h-4 w-4 fill-white text-primary" />
              Beli Akun
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Preview Gambar Layar Penuh"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Tutup preview"
            className="absolute right-4 top-4 z-50 rounded-full border border-white/20 bg-black/60 p-2.5 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Photo Counter Top Bar */}
          <div className="absolute left-4 top-4 z-50 flex items-center gap-3">
            <span className="rounded-xl border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md">
              {selectedImageIndex + 1} / {totalImages} Screenshot
            </span>
            <span className="text-muted-foreground hidden max-w-sm truncate text-xs font-medium sm:inline-block">
              {account.title}
            </span>
          </div>

          {/* Previous image button */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              aria-label="Foto sebelumnya"
              className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next image button */}
          {totalImages > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              aria-label="Foto berikutnya"
              className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Center Large Image */}
          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-5xl items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full">
              <Image
                src={resolveStorageUrl(account.images[selectedImageIndex])}
                alt={`${account.title} - Screenshot ${selectedImageIndex + 1}`}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Bottom Thumbnails bar in Lightbox */}
          {totalImages > 1 && (
            <div
              className="absolute bottom-4 left-1/2 z-50 flex max-w-md -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur-md sm:max-w-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {account.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={cn(
                    "relative aspect-video w-16 shrink-0 overflow-hidden rounded-lg border transition-all sm:w-20",
                    selectedImageIndex === idx
                      ? "border-primary ring-primary scale-105 ring-2"
                      : "border-white/20 opacity-50 hover:opacity-100",
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
      )}
    </div>
  );
}
