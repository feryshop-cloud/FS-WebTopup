"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import LogoInstan from "@/components/logo/instan";
import type { HomeFallbackData } from "@/lib/data/home";

interface PromoProduct {
  id: number;
  title: string;
  selling_price: number;
  selling_price_gold: number;
  selling_price_platinum: number;
  promo_price: number;
  game_image?: string;
  game_slug: string;
  game_title?: string;
  end_at: string;
}

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Promo({ initialData }: { initialData?: HomeFallbackData["promo"] }) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "user";

  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; products: PromoProduct[] }>(
    "/api/promo",
    fetcher,
    {
      keepPreviousData: true,
      revalidateIfStale: false,
      dedupingInterval: 300_000,
      fallbackData: initialData as any,
    },
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const promoEndAt = data?.products?.[0]?.end_at;

  const getPriceByRole = (item: PromoProduct, r: string) => {
    if (r === "platinum") return Number(item.selling_price_platinum ?? item.selling_price);
    if (r === "gold") return Number(item.selling_price_gold ?? item.selling_price);
    return Number(item.selling_price ?? 0);
  };

  const items = useMemo(() => {
    const products = Array.isArray(data?.products) ? data.products : [];

    return products
      .map((p) => {
        const base = getPriceByRole(p, role);
        const promo = Number(p.promo_price ?? 0);
        const diff = Math.max(0, base - promo);
        const gameName = p.game_title?.trim()
          ? p.game_title.trim()
          : toTitleCaseFromSlug(p.game_slug);

        return {
          ...p,
          base_price: base,
          promo_price_num: promo,
          diff,
          gameName,
        };
      })
      .filter((p) => p.promo_price_num > 0 && p.base_price > 0 && p.promo_price_num < p.base_price);
  }, [data, role]);

  const isPromoExpired = (endTime: string) => new Date(endTime).getTime() <= Date.now();

  useEffect(() => {
    if (!promoEndAt) return;

    const end = new Date(promoEndAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const distance = end - now;

      if (distance <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [promoEndAt]);

  useEffect(() => {
    if (!scrollRef.current || !items.length) return;

    const container = scrollRef.current;
    const cardWidth = 240 + 16;
    let index = 0;

    const scrollNext = () => {
      if (!container) return;

      index += 1;

      if (index >= items.length) {
        setTimeout(() => {
          container.scrollTo({ left: 0, behavior: "smooth" });
          index = 0;
        }, 700);
      } else {
        container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
      }
    };

    const interval = setInterval(scrollNext, 3000);
    return () => clearInterval(interval);
  }, [items]);

  if (isLoading) {
    return (
      <div className="bg-muted w-full rounded-2xl pb-4">
        <div className="p-4">
          <Skeleton className="mb-2 h-5 w-28" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="hide-scrollbar flex gap-4 overflow-x-auto px-4 py-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-background flex w-[240px] flex-shrink-0 rounded-2xl p-3 shadow-sm"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="ml-3 flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-muted w-full rounded-2xl pb-4">
        <div className="p-4">
          <div className="border-border bg-background rounded-xl border p-4">
            <div className="text-sm font-semibold">Promo gagal dimuat</div>
            <div className="text-muted-foreground mt-1 text-xs">
              {(error as Error)?.message ?? "Terjadi kesalahan."}
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => mutate()}
                className="border-border bg-background inline-flex h-9 items-center rounded-lg border px-3 text-xs font-medium"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length || (promoEndAt && isPromoExpired(promoEndAt))) {
    return null;
  }

  return (
    <div className="bg-muted w-full rounded-2xl pb-4">
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Image src="/voltage.gif" alt="Flash Sale" width={20} height={20} className="h-5 w-5" />
          <h2 className="text-lg font-bold tracking-wide">Flash Sale!</h2>
          <div className="ml-auto flex gap-1 font-mono text-sm">
            {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
              <span key={unit} className="bg-background rounded px-2 py-1">
                {countdown[unit].toString().padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
        <p className="mb-2 text-sm">Jangan sampai kehabisan, order sekarang!</p>
      </div>

      <div
        className="scroll-container hide-scrollbar flex gap-4 overflow-x-auto px-4 py-1"
        ref={scrollRef}
      >
        {items.map((item) => (
          <Link
            href={{ pathname: `/order/${item.game_slug}`, query: { product_id: item.id } }}
            key={item.id}
            className="bg-background flex w-[240px] flex-shrink-0 rounded-2xl p-3 shadow-sm transition-transform hover:scale-[1.01]"
          >
            <div className="flex w-full flex-col divide-y">
              <div className="space-y-1 pb-3">
                <div className="line-clamp-2 text-xs font-semibold">{item.title}</div>
                <div className="text-muted-foreground line-clamp-1 text-[11px]">
                  {item.gameName}
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
                    {item.game_image ? (
                      <Image src={item.game_image} alt={item.title} fill className="object-cover" />
                    ) : (
                      <div className="text-muted-foreground flex h-full w-full items-center justify-center text-[10px]">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-my-color text-[12px] font-semibold">
                      Rp {item.promo_price_num.toLocaleString("id-ID")}
                    </div>
                    <div className="text-my-hoverColor text-[11px] line-through">
                      Rp {item.base_price.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <span className="bg-my-color rounded px-2 py-0.5 text-[10px] font-semibold text-white">
                  - Rp {item.diff.toLocaleString("id-ID")}
                </span>
                <span className="inline-flex items-center gap-2 rounded bg-white px-2 py-1">
                  <LogoInstan className="h-3 w-12" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
