"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ContentLayout title="Terjadi Kesalahan">
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="border-border/60 bg-card max-w-md rounded-3xl border p-8 text-center shadow-sm">
          <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <WifiOff className="h-8 w-8" />
          </div>

          <h1 className="mb-2 text-xl font-extrabold tracking-tight">Gagal memuat data</h1>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Sepertinya terjadi kendala pada koneksi atau server sedang sibuk. Silakan coba lagi
            sebentar.
          </p>

          {error?.digest ? (
            <p className="text-muted-foreground/60 mb-4 text-[11px]">
              Kode kesalahan: {error.digest}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              onClick={() => reset()}
              className="bg-my-color font-bold text-white hover:opacity-90"
            >
              Coba Lagi
            </Button>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Muat Ulang Halaman
            </Button>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
