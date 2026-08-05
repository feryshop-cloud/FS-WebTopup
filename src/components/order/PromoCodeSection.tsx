"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { apiPath } from "@/lib/routes";

type ApplyResult = {
  code: string;
  discount: number;
  finalPrice: number;
};

type PromoListItem = {
  id: number;
  name: string;
  code: string;
  status: string;
  is_eligible: boolean;
  ineligible_reasons?: string[];
  discount_type?: string;
  discount_value?: number;
  min_product_price?: number | null;
  start_at?: string | null;
  end_at?: string | null;
  usage_limit_total?: number | null;
  used_count?: number;
};

interface PromoCodeSectionProps {
  gameSlug: string | null;
  productId: string | null;
  paymentMethodId: string | null;
  whatsapp: string;
  quantity?: number;
  onApplied: (result: ApplyResult) => void;
  onCleared: () => void;
  appliedCode: string | null;
  appliedDiscount: number;
  stepNumber?: number;
  sectionId?: string;
}

const n = (v: any) => {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
};

const money = (v: any) => Math.max(0, Math.floor(n(v)));

export default function PromoCodeSection({
  gameSlug,
  productId,
  paymentMethodId,
  whatsapp,
  quantity = 1,
  onApplied,
  onCleared,
  appliedCode,
  appliedDiscount,
  stepNumber,
  sectionId,
}: PromoCodeSectionProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const [openList, setOpenList] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [promoList, setPromoList] = useState<PromoListItem[]>([]);

  useEffect(() => {
    if (!appliedCode) return;
    setCode(appliedCode);
  }, [appliedCode]);

  const canApply = useMemo(() => {
    return Boolean(gameSlug && productId && paymentMethodId && code.trim().length > 0);
  }, [gameSlug, productId, paymentMethodId, code]);

  const canFetchList = useMemo(() => {
    return Boolean(gameSlug && productId && paymentMethodId);
  }, [gameSlug, productId, paymentMethodId]);

  const step = useMemo(() => {
    const x = Number(stepNumber);
    return Number.isFinite(x) && x > 0 ? Math.floor(x) : 4;
  }, [stepNumber]);

  const resolvedSectionId = useMemo(
    () => (sectionId ? String(sectionId) : String(step)),
    [sectionId, step],
  );

  const fetchList = async () => {
    if (!canFetchList || listLoading) return;

    setListLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("game", String(gameSlug));
      q.set("product_id", String(productId));
      q.set("payment_method_id", String(paymentMethodId));

      const res = await fetch(apiPath(`/api/promo-codes?${q.toString()}`), { cache: "no-store" });
      const json = await res.json().catch(() => ({}) as any);

      if (!res.ok || !json?.success) {
        setPromoList([]);
        toast.error(json?.message || "Gagal memuat daftar promo.");
        return;
      }

      const data = Array.isArray(json?.data) ? (json.data as PromoListItem[]) : [];
      setPromoList(data);
    } catch {
      setPromoList([]);
      toast.error("Gagal memuat daftar promo.");
    } finally {
      setListLoading(false);
    }
  };

  const applyPromo = async () => {
    if (!canApply || loading) return;

    setLoading(true);
    try {
      const res = await fetch(apiPath("/api/promo-codes/validate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          game_slug: gameSlug,
          product_id: productId,
          payment_method_id: paymentMethodId,
          whatsapp: whatsapp || null,
          quantity: Math.max(1, Math.floor(Number(quantity) || 1)),
        }),
      });

      const json = await res.json().catch(() => ({}) as any);

      if (!res.ok || !json?.success) {
        toast.error(json?.message || "Kode promo tidak valid.");
        return;
      }

      const pricing = json?.data?.pricing ?? {};
      const promo = json?.data?.promo ?? {};

      const discount = money(pricing?.discount ?? 0);
      const finalPrice = money(pricing?.final_price ?? 0);
      const applied = String(promo?.code ?? code)
        .trim()
        .toUpperCase();

      if (!applied) {
        toast.error("Kode promo tidak valid.");
        return;
      }

      onApplied({ code: applied, discount, finalPrice });
      toast.success("Kode promo berhasil digunakan.");
    } catch {
      toast.error("Gagal menerapkan kode promo.");
    } finally {
      setLoading(false);
    }
  };

  const clearPromo = async () => {
    if (loading) return;
    setLoading(true);
    try {
      setCode("");
      onCleared();
      toast.success("Kode promo dibatalkan.");
    } finally {
      setLoading(false);
    }
  };

  const openPromoList = async () => {
    setOpenList(true);
    await fetchList();
  };

  const pickPromo = (c: string) => {
    const next = String(c || "")
      .trim()
      .toUpperCase();
    if (!next) return;
    setCode(next);
    setOpenList(false);
  };

  return (
    <section
      id={resolvedSectionId}
      className="bg-background ring-border relative scroll-mt-20 rounded-xl shadow-sm ring-1 md:scroll-mt-[7.5rem]"
    >
      <div className="bg-muted flex items-center rounded-t-xl px-4 py-2">
        <div className="bg-my-color flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white">
          {step}
        </div>
        <h2 className="text-card-foreground ml-3 text-sm font-semibold">
          Gunakan Kode Promo (Jika Ada)
        </h2>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Masukkan kode promo"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="border-border bg-muted text-foreground placeholder-muted-foreground focus:ring-my-color w-full rounded-lg border px-4 py-3 text-xs focus:outline-none focus:ring-2"
          />

          {appliedCode ? (
            <button
              type="button"
              onClick={clearPromo}
              disabled={loading}
              className="rounded-lg bg-red-500 px-4 py-3 text-xs font-semibold text-white disabled:opacity-60"
            >
              Batalkan
            </button>
          ) : (
            <button
              type="button"
              onClick={applyPromo}
              disabled={!canApply || loading}
              className="bg-my-color rounded-lg px-4 py-3 text-xs font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Gunakan"}
            </button>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={openPromoList}
            disabled={!canFetchList}
            className="text-my-color text-xs font-semibold hover:underline disabled:opacity-50"
          >
            Lihat kode promo
          </button>
        </div>

        {appliedCode && (
          <div className="border-border bg-muted/40 rounded-lg border px-4 py-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Promo Aktif</span>
              <span className="text-primary font-semibold">{appliedCode}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-muted-foreground">Diskon (per item)</span>
              <span className="text-foreground font-semibold">
                Rp {money(appliedDiscount).toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}
      </div>

      <Dialog open={openList} onOpenChange={setOpenList}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Daftar Kode Promo</DialogTitle>
            <DialogDescription>Pilih promo yang tersedia untuk checkout ini.</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-3 overflow-y-auto">
            {listLoading ? (
              <div className="text-muted-foreground text-sm">Memuat promo...</div>
            ) : promoList.length === 0 ? (
              <div className="text-muted-foreground text-sm">Belum ada promo yang tersedia.</div>
            ) : (
              promoList.map((p) => {
                const disabled = !p.is_eligible || String(p.status).toUpperCase() !== "ACTIVE";

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickPromo(p.code)}
                    disabled={disabled}
                    className="border-border bg-muted/40 w-full rounded-xl border px-4 py-3 text-left text-sm disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-foreground font-semibold">{p.code}</div>
                      <div className="text-muted-foreground text-xs font-semibold">{p.name}</div>
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {disabled ? "Tidak memenuhi syarat" : "Bisa digunakan"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
