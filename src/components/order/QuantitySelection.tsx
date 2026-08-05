"use client";

import { useMemo } from "react";

interface QuantitySelectionProps {
  quantity: number;
  setQuantity: (quantity: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelection({
  quantity,
  setQuantity,
  min = 1,
  max = 50,
}: QuantitySelectionProps) {
  const clamped = useMemo(() => {
    const n = Number.isFinite(quantity) ? Math.floor(quantity) : min;
    return Math.max(min, Math.min(max, n));
  }, [quantity, min, max]);

  const canDecrement = clamped > min;
  const canIncrement = clamped < max;

  const apply = (next: number) => {
    const n = Number.isFinite(next) ? Math.floor(next) : min;
    setQuantity(Math.max(min, Math.min(max, n)));
  };

  return (
    <section
      id="3"
      className="bg-background ring-border relative scroll-mt-20 rounded-xl shadow-sm ring-1 md:scroll-mt-[7.5rem]"
    >
      <div className="bg-muted flex items-center rounded-t-xl px-4 py-2">
        <div className="bg-my-color flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white">
          3
        </div>
        <h2 className="text-card-foreground ml-3 text-sm font-semibold">
          Masukkan Jumlah Pembelian
        </h2>
      </div>

      <div className="p-4">
        <div className="border-border bg-muted/40 flex w-full items-center justify-between gap-3 rounded-xl border p-3">
          <button
            type="button"
            onClick={() => apply(clamped - 1)}
            disabled={!canDecrement}
            className="border-border bg-background text-foreground hover:bg-muted inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Kurangi jumlah"
          >
            -
          </button>

          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={clamped}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                apply(min);
                return;
              }

              const next = parseInt(raw, 10);
              apply(Number.isFinite(next) ? next : min);
            }}
            className="border-border bg-background text-foreground focus:ring-my-color h-10 w-full max-w-[140px] rounded-lg border px-3 text-center text-sm font-semibold focus:outline-none focus:ring-2"
          />

          <button
            type="button"
            onClick={() => apply(clamped + 1)}
            disabled={!canIncrement}
            className="border-border bg-background text-foreground hover:bg-muted inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}
