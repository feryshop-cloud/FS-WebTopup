"use client";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
            </div>

            <h1 className="mb-2 text-xl font-extrabold tracking-tight">Gagal memuat data</h1>
            <p className="mb-6 text-sm leading-relaxed text-zinc-400">
              Terjadi kendala pada aplikasi. Silakan coba lagi, atau muat ulang halaman.
            </p>

            {error?.digest ? (
              <p className="mb-4 text-[11px] text-zinc-500">Kode kesalahan: {error.digest}</p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-700"
              >
                Muat Ulang Halaman
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
