"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

interface PaymentSelectionProps {
  paymentRef: React.RefObject<HTMLDivElement | null>;
  groupedPaymentMethods: Record<string, PaymentMethod[]>;
  outsidePaymentMethods: PaymentMethod[];
  selectedPayment: string | null;
  setSelectedPayment: (id: string) => void;
  stepNumber?: number;
  sectionId?: string;
}

const normalizeAmount = (v: any) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const isDisabledByLimit = (method: PaymentMethod) => {
  const total = normalizeAmount(method.totalPrice);
  const min = normalizeAmount(method.minimum_amount);
  const maxRaw = Number(method.maximum_amount ?? 0);
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? maxRaw : 0;

  if (min > 0 && total < min) return true;
  if (max > 0 && total > max) return true;
  return false;
};

const PAYMENT_IMAGE_FALLBACK = "/placeholder.png";

const resolvePaymentImage = (images: unknown, method: PaymentMethod): string => {
  const isQris =
    String(method.id).toLowerCase() === "qris" ||
    String(method.payment_id ?? "").toLowerCase() === "qris";
  const fallback = isQris ? "/qris.webp" : PAYMENT_IMAGE_FALLBACK;

  if (Array.isArray(images)) {
    for (const item of images) {
      if (typeof item === "string" && item.trim() !== "") return item.trim();
    }
    return fallback;
  }

  if (typeof images !== "string") return fallback;

  const trimmed = images.trim();
  if (!trimmed) return fallback;
  if (trimmed === "noimage.png" || trimmed === "[]" || trimmed === "{}") return fallback;
  return trimmed;
};

export default function PaymentSelection({
  paymentRef,
  groupedPaymentMethods,
  outsidePaymentMethods,
  selectedPayment,
  setSelectedPayment,
  stepNumber,
  sectionId,
}: PaymentSelectionProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    const groups = Object.keys(groupedPaymentMethods);
    if (groups.length > 0) {
      setOpenAccordion((prev) => prev ?? groups[0]);
    }
  }, [groupedPaymentMethods]);

  const step = useMemo(() => {
    const n = Number(stepNumber);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
  }, [stepNumber]);

  const resolvedSectionId = sectionId ? String(sectionId) : String(step);

  return (
    <section
      ref={paymentRef}
      className="bg-background ring-border relative scroll-mt-20 rounded-xl shadow-sm ring-1 md:scroll-mt-[7.5rem]"
      id={resolvedSectionId}
    >
      <div className="bg-muted flex items-center rounded-t-xl px-4 py-2">
        <div className="bg-my-color flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white">
          {step}
        </div>
        <h2 className="text-card-foreground ml-3 text-sm font-semibold">Pilih Pembayaran</h2>
      </div>

      <div className="space-y-4 p-4">
        {outsidePaymentMethods.length > 0 && (
          <div className="space-y-3">
            {outsidePaymentMethods.map((method) => {
              const isDisabled = isDisabledByLimit(method);
              const isSelected = selectedPayment === method.id;
              const imgSrc = resolvePaymentImage(method.images, method);

              return (
                <label
                  key={method.id}
                  className={cn(
                    "bg-muted/30 ring-border relative flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-4 ring-1",
                    !isDisabled &&
                      "hover:ring-my-color hover:ring-offset-background hover:ring-2 hover:ring-offset-2",
                    isDisabled && "cursor-not-allowed opacity-50",
                    isSelected && "ring-my-color ring-2",
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    className="sr-only"
                    disabled={isDisabled}
                    checked={isSelected}
                    onChange={() => setSelectedPayment(method.id)}
                  />

                  {method.badge_text && (
                    <div className="absolute right-0 top-0 overflow-hidden rounded-bl-xl rounded-tr-xl">
                      <div className="bg-my-color px-3 py-1 text-[11px] font-semibold text-white">
                        {method.badge_text}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-16 items-center justify-center rounded-md bg-white p-1">
                      {imgSrc && (
                        <Image
                          alt={method.name}
                          width={120}
                          height={60}
                          className="h-full w-full object-contain"
                          src={imgSrc}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-[13px] font-semibold">
                        {method.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-primary text-sm font-semibold">
                    Rp {(method.totalPrice ?? 0).toLocaleString("id-ID")}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {Object.entries(groupedPaymentMethods).map(([group, methods]) => {
          const isOpen = openAccordion === group;

          return (
            <div key={group} className="bg-muted/40 rounded-xl border">
              <button
                type="button"
                className="bg-muted flex w-full items-center justify-between rounded-t-xl px-4 py-3 font-medium"
                onClick={() => setOpenAccordion(isOpen ? null : group)}
              >
                <span>{group}</span>
                <svg
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isOpen ? "rotate-180" : "rotate-0",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={cn(
                  "transition-all duration-300",
                  isOpen
                    ? "max-h-[90vh] overflow-y-auto py-4 opacity-100"
                    : "max-h-0 overflow-hidden opacity-0",
                )}
              >
                <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3">
                  {methods.map((method) => {
                    const isDisabled = isDisabledByLimit(method);
                    const isSelected = selectedPayment === method.id;
                    const imgSrc = resolvePaymentImage(method.images, method);

                    return (
                      <label
                        key={method.id}
                        className={cn(
                          "group/variant bg-muted text-muted-foreground relative flex min-h-[85px] cursor-pointer gap-4 rounded-xl border border-transparent shadow-sm",
                          !isDisabled &&
                            "hover:ring-my-color hover:ring-offset-background hover:ring-2 hover:ring-offset-2",
                          isDisabled && "cursor-not-allowed opacity-50",
                          isSelected && "ring-my-color ring-2",
                        )}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          className="sr-only"
                          disabled={isDisabled}
                          checked={isSelected}
                          onChange={() => setSelectedPayment(method.id)}
                        />

                        <span className="w-full">
                          <span className="divide-muted-foreground/10 flex h-full flex-col justify-between divide-y">
                            <div className="flex flex-col justify-start gap-1 p-3">
                              <span className="block text-[11px] font-semibold">{method.name}</span>

                              <div className="flex w-full flex-col">
                                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
                                  {imgSrc && (
                                    <Image
                                      alt={method.name}
                                      priority
                                      width={300}
                                      height={300}
                                      className="h-full w-full object-contain"
                                      sizes="80vh"
                                      src={imgSrc}
                                    />
                                  )}
                                </div>

                                <div>
                                  <span className="text-primary flex items-center text-[14px] font-semibold md:text-[16px]">
                                    Rp {(method.totalPrice ?? 0).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {!isOpen && (
                <button
                  type="button"
                  onClick={() => setOpenAccordion(group)}
                  className="hide-scrollbar bg-muted/10 flex w-full items-center gap-2 overflow-x-auto rounded-b-xl px-3 py-2"
                >
                  {methods.map((method) => {
                    const imgSrc = resolvePaymentImage(method.images, method);

                    return (
                      imgSrc && (
                        <div
                          key={method.id}
                          className="flex min-h-[36px] min-w-[36px] items-center justify-center"
                        >
                          <Image
                            alt={method.name}
                            src={imgSrc}
                            width={36}
                            height={36}
                            className="h-6 w-16 rounded-md bg-white object-contain p-1"
                          />
                        </div>
                      )
                    );
                  })}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
