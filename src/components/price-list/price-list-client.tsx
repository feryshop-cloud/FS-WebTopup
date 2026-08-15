"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { MEMBER_PRICE_FLAG } from "@/lib/pricing";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { PriceListGame } from "@/lib/data/price-list";

const num = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const fmtRupiah = (v: any) => {
  const n = Math.max(0, Math.floor(num(v)));
  if (!n) return "-";
  return `Rp ${n.toLocaleString("id-ID")}`;
};

type PriceRole = "basic" | "gold" | "platinum";

const ROLE_LABEL: Record<PriceRole, string> = {
  basic: "Basic",
  gold: "Gold",
  platinum: "Platinum",
};

interface PriceListClientProps {
  games: PriceListGame[];
}

export function PriceListClient({ games }: PriceListClientProps) {
  const [selectedGameId, setSelectedGameId] = useState<string>(
    games.length > 0 ? String(games[0].id) : "",
  );
  const [role, setRole] = useState<PriceRole>("basic");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const selectedGame = useMemo(
    () => games.find((g) => String(g.id) === String(selectedGameId)) || null,
    [selectedGameId, games],
  );

  const { data, error, isLoading, mutate } = useSWR<any>(
    selectedGame ? `/api/price-list?game=${encodeURIComponent(selectedGame.slug)}` : null,
    fetcher,
    {
      keepPreviousData: true,
      revalidateIfStale: false,
      dedupingInterval: 300_000,
    },
  );

  const loading = isLoading && !data;
  const err = error ? String(error?.message || error) : null;

  const products = useMemo(() => {
    const list = Array.isArray(data?.data) ? data.data : [];
    const game = list[0] || null;
    return Array.isArray(game?.products) ? game.products : [];
  }, [data]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p: any) => {
      const title = String(p.title || "").toLowerCase();
      const brand = String(p.brand || "").toLowerCase();
      return title.includes(q) || brand.includes(q);
    });
  }, [products, search]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage)),
    [filteredProducts, itemsPerPage],
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const priceFor = (product: any): number => {
    if (!MEMBER_PRICE_FLAG || role === "basic") return Number(product.selling_price ?? 0);
    if (role === "gold") return Number(product.selling_price_gold ?? product.selling_price);
    return Number(product.selling_price_platinum ?? product.selling_price);
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-md">
        <Select
          value={selectedGameId}
          onValueChange={(v) => {
            setSelectedGameId(v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Game" />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game.id} value={String(game.id)}>
                {game.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Cari produk atau brand..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        {MEMBER_PRICE_FLAG && (
          <Select value={role} onValueChange={(v) => setRole(v as PriceRole)}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABEL) as PriceRole[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {err ? (
        <div className="bg-background mx-auto w-full max-w-4xl rounded-md border p-4 text-sm">
          <div className="font-semibold text-red-600">Gagal memuat daftar harga</div>
          <div className="text-muted-foreground mt-1">{err}</div>
          <div className="mt-3">
            <Button type="button" onClick={() => mutate()}>
              Coba Lagi
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="bg-background mx-auto w-full max-w-4xl rounded-md border p-4">
          <Skeleton className="h-10 w-full" />
          <div className="mt-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ) : paginatedProducts.length === 0 ? (
        <div className="bg-background text-muted-foreground mx-auto w-full max-w-4xl rounded-md border p-4 text-sm">
          Tidak ada produk.
        </div>
      ) : (
        <div className="bg-background mx-auto w-full max-w-4xl rounded-md border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[260px]">Produk</TableHead>
                  <TableHead className="whitespace-nowrap text-left">
                    {MEMBER_PRICE_FLAG ? ROLE_LABEL[role] : "Harga"}
                  </TableHead>
                  <TableHead className="whitespace-nowrap text-left">Status</TableHead>
                  <TableHead className="whitespace-nowrap text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedProducts.map((product: any) => {
                  const isActive = product.status === 1;
                  const href = selectedGame?.slug
                    ? `/order/${selectedGame.slug}?product_id=${encodeURIComponent(String(product.id))}`
                    : "#";

                  const imageUrl = product.logo || selectedGame?.logo || null;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="min-w-[260px]">
                        <div className="flex items-center gap-3">
                          <div className="bg-muted relative h-10 w-10 overflow-hidden rounded-md border">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <div className="line-clamp-2 font-medium leading-tight">
                              {product.title}
                            </div>
                            <div className="text-muted-foreground text-xs">{product.brand}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {fmtRupiah(priceFor(product))}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={isActive ? "text-emerald-600" : "text-red-600"}>
                            {isActive ? "Tersedia" : "Gangguan"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap text-center">
                        <Button asChild size="sm" disabled={!selectedGame?.slug || !isActive}>
                          <Link href={href} className="inline-flex items-center gap-2">
                            Order <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2 p-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Sebelumnya
              </Button>

              <div className="text-muted-foreground text-sm">
                Halaman {currentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Berikutnya
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
