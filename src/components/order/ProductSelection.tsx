"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import LogoInstan from "@/components/logo/instan";
import { Product } from "@/types";

interface ProductSelectionProps {
  isLoading: boolean;
  products: Product[];
  selectedProduct: string | null;
  setSelectedProduct: (productId: string) => void;
  productRef: React.RefObject<HTMLElement | null>;
  role?: string | null;
}

const getPriceByRole = (p: Product, role?: string | null) =>
  role === "gold"
    ? p.selling_price_gold
    : role === "platinum"
      ? p.selling_price_platinum
      : p.selling_price;

const displayCategoryName = (title: string) => {
  if (title === "Top Up") return "Umum";
  return title;
};

const isUmumCategory = (title: string) => title === "Top Up" || title === "Umum";

const ProductSelection: React.FC<ProductSelectionProps> = ({
  isLoading,
  products,
  selectedProduct,
  setSelectedProduct,
  productRef,
  role,
}) => {
  const grouped = useMemo(() => {
    return products.reduce(
      (acc, product) => {
        const raw = product.category?.title || "Top Up";
        const key = isUmumCategory(raw) ? "Top Up" : raw;
        if (!acc[key]) {
          acc[key] = {
            items: [],
            logo: product.category?.logo || null,
          };
        }
        acc[key].items.push(product);
        return acc;
      },
      {} as Record<string, { items: Product[]; logo: string | null }>,
    );
  }, [products]);

  const categories = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      const aUmum = isUmumCategory(a);
      const bUmum = isUmumCategory(b);
      if (aUmum && !bUmum) return -1;
      if (!aUmum && bUmum) return 1;
      return a.localeCompare(b);
    });
  }, [grouped]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const activeCategory =
    selectedCategory && categories.includes(selectedCategory)
      ? selectedCategory
      : categories[0] || null;
  const current = activeCategory;

  const renderProductCard = (product: Product) => {
    const isSelected = String(selectedProduct) === String(product.id);
    const price = getPriceByRole(product, role);
    const promoPrice = product.promo_price ?? null;
    const isPromo = promoPrice !== null && promoPrice !== undefined;
    const disc =
      isPromo && price > promoPrice ? Math.round(((price - promoPrice) / price) * 100) : 0;

    return (
      <label
        key={product.id}
        className={`bg-muted relative flex min-h-[85px] cursor-pointer gap-4 rounded-xl shadow-sm ${
          isSelected ? "ring-my-color ring-2" : ""
        }`}
      >
        <input
          type="radio"
          name="productId"
          value={product.id}
          className="sr-only"
          checked={isSelected}
          onChange={() => setSelectedProduct(String(product.id))}
        />

        <span className="flex w-full flex-col justify-between divide-y">
          <span className="space-y-1 p-3">
            <span className="text-xs font-semibold">{product.title}</span>
            <div className="flex items-center gap-2">
              {(product.logo || product.images) && (
                <Image
                  src={(product.logo || product.images) as string}
                  alt={product.title}
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain"
                />
              )}
              {isPromo ? (
                <div>
                  <div className="text-my-hoverColor text-xs line-through">
                    Rp {price.toLocaleString("id-ID")}
                  </div>
                  <div className="text-my-color font-semibold">
                    Rp {promoPrice!.toLocaleString("id-ID")}
                  </div>
                </div>
              ) : (
                <div className="text-my-color font-semibold">
                  Rp {price.toLocaleString("id-ID")}
                </div>
              )}
            </div>
          </span>

          <span className="bg-muted/40 flex items-center justify-end gap-2 rounded-b-xl p-2">
            {disc > 0 && (
              <span className="bg-my-color rounded px-2 py-0.5 text-[10px] font-semibold text-white">
                Disc {disc}%
              </span>
            )}
            <div className="rounded bg-white p-1">
              <LogoInstan className="h-3 w-12" />
            </div>
          </span>
        </span>
      </label>
    );
  };

  return (
    <section ref={productRef} className="bg-background ring-border rounded-xl shadow-sm ring-1">
      <div className="bg-muted flex items-center rounded-t-xl px-4 py-2">
        <div className="bg-my-color flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white">
          2
        </div>
        <h2 className="text-card-foreground ml-3 text-sm font-semibold">Pilih Produk</h2>
      </div>

      <div className="space-y-4 p-4">
        {!isLoading && categories.length > 1 && (
          <div className="hide-scrollbar flex gap-3 overflow-x-auto">
            {categories.map((cat) => {
              const active = current === cat;
              const logo = cat !== "Top Up" ? grouped[cat]?.logo : null;
              const label = displayCategoryName(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory(cat);
                  }}
                  className={`flex h-[90px] w-[120px] flex-none flex-col items-center justify-center gap-2 rounded-lg border transition ${
                    active ? "border-my-color bg-my-color/10" : "bg-muted border-transparent"
                  }`}
                >
                  {cat === "Top Up" ? (
                    <Image
                      src="/logo-topup.webp"
                      alt={label}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : logo ? (
                    <Image
                      src={logo}
                      alt={label}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <Image
                      src="/logo-topup.webp"
                      alt={label}
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  )}

                  <span className={`text-xs font-medium ${active ? "text-my-color" : "text-gray"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted min-h-[85px] animate-pulse rounded-xl" />
              ))
            : (current ? grouped[current]?.items : [])?.map(renderProductCard)}
        </div>
      </div>
    </section>
  );
};

export default ProductSelection;
