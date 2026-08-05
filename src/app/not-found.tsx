"use client";

import { ContentLayout } from "@/components/panel/content-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <ContentLayout title="Not Found Page">
      <div className="-my-24 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Oops! Halaman yang Anda cari tidak ditemukan.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Kembali ke Halaman Utama</Link>
        </Button>
      </div>
    </ContentLayout>
  );
}
