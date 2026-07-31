"use client";

import { ShieldCheck, UserCheck, RefreshCw, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MarketplaceWhyUsSection() {
  const steps = [
    {
      step: "01",
      title: "Pilih Akun Impian",
      desc: "Telusuri katalog berdasarkan kategori game, filter rank, skin sultan, atau rentang harga sesuai budget kamu.",
    },
    {
      step: "02",
      title: "Klik Beli / Rekber",
      desc: "Hubungi admin melalui tombol Rekber Resmi. Admin akan menahan dana kamu secara aman hingga proses pengecekan selesai.",
    },
    {
      step: "03",
      title: "Cek Data Akun",
      desc: "Seller memberikan data login (email & password). Kamu silakan login, periksa spesifikasi akun, dan ganti password/bind ke email baru.",
    },
    {
      step: "04",
      title: "Transaksi Selesai",
      desc: "After data aman 100% di tangan kamu, konfirmasi ke admin agar dana diteruskan ke penjual. Garansi anti-hack aktif selamanya!",
    },
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      title: "Garansi Anti-Hack 100%",
      desc: "Setiap akun yang dijual telah melalui screening ketat. Jika terjadi hack-back oleh seller, uang kembali 100%.",
    },
    {
      icon: <UserCheck className="h-6 w-6 text-primary" />,
      title: "Verified Sultan Seller",
      desc: "Penjual di Feryshop wajib verifikasi KTP & identitas resmi. Reputasi toko transparan dengan ulasan asli pembeli.",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-brand-blue" />,
      title: "Sistem Rekaman & Resi",
      desc: "Seluruh serah terima data direkam dan dilengkapi bukti top-up pertama untuk klaim garansi pemulihan jika diperlukan.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-amber-500" />,
      title: "Kawalan Admin 24/7",
      desc: "Tim Rekber Feryshop siap membimbing proses log-in dan pengamanan akun sampai tuntas tanpa ribet.",
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Why Us / Keunggulan */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Mengapa Beli Akun di <span className="text-primary">Feryshop Marketplace?</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Keamanan pembeli adalah prioritas mutlak kami dengan sistem pengamanan berlapis dan Rekening Bersama (Rekber) resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-6">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/70 bg-card p-5 space-y-3 hover:border-primary/40 transition-colors shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 border border-border/50">
                {benefit.icon}
              </div>
              <h3 className="text-base font-bold text-foreground">{benefit.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cara Kerja / How to Buy */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Panduan Transaksi</span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              4 Langkah Mudah & Aman Beli Akun
            </h2>
          </div>
          <Button asChild className="rounded-xl px-5 self-start sm:self-auto gap-2">
            <Link href="/contact">
              Tanya CS Rekber
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-x-6 sm:gap-y-6 relative">
          {steps.map((item, index) => (
            <div key={index} className="relative space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-md">
                  {item.step}
                </span>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
