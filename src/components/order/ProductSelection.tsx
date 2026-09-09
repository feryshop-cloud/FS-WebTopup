"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Gem, Zap, Gift, Sparkles, Search, X, Check, Globe } from "lucide-react";
import LogoInstan from "@/components/logo/instan";
import { Product } from "@/types";
import { getPriceByRole } from "@/lib/pricing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductSelectionProps {
  isLoading: boolean;
  products: Product[];
  selectedProduct: string | null;
  setSelectedProduct: (productId: string) => void;
  productRef: React.RefObject<HTMLElement | null>;
  role?: string | null;
}

// Category classification rules
type CategoryKey = "pass" | "reguler" | "promo" | "other";

interface CategoryMeta {
  key: CategoryKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  pass: {
    key: "pass",
    label: "Weekly Pass & Membership",
    icon: Zap,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-400/10 border-amber-400/20",
  },
  reguler: {
    key: "reguler",
    label: "Top Up Reguler",
    icon: Gem,
    iconColor: "text-[#00A2E9]",
    bgColor: "bg-[#00A2E9]/10 border-[#00A2E9]/20",
  },
  promo: {
    key: "promo",
    label: "First Top Up & Bonus",
    icon: Gift,
    iconColor: "text-my-color",
    bgColor: "bg-my-color/10 border-my-color/20",
  },
  other: {
    key: "other",
    label: "Paket Khusus & Lainnya",
    icon: Sparkles,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-400/10 border-purple-400/20",
  },
};

const CATEGORY_ORDER: CategoryKey[] = ["reguler", "pass", "promo", "other"];

function categorizeProduct(product: Product): CategoryKey {
  const title = (product.title || "").toLowerCase();
  const rawCat = (product.category?.title || "").toLowerCase();

  // Explicit DB category if meaningful
  if (rawCat && rawCat !== "top up" && rawCat !== "umum") {
    if (/pass|member|starlight|langganan|subscription/i.test(rawCat)) return "pass";
    if (/promo|bonus|first\s*top/i.test(rawCat)) return "promo";
    if (/reguler|nominal|diamond|cash/i.test(rawCat)) return "reguler";
  }

  // Pass, membership, starlight, twilight, level up, battle pass
  if (
    /weekly\s*(?:diamond)?\s*pass|starlight|twilight\s*pass|membership|level\s*up\s*pass|strike\s*pass|support\s*pass|welkin|blessing|battle\s*pass/i.test(
      title,
    )
  ) {
    return "pass";
  }

  // First top up, starter pack, bonus packages
  if (/first\s*top\s*up|starter\s*pack|bonus\s*diamond/i.test(title)) {
    return "promo";
  }

  // Default to regular currency
  return "reguler";
}

function extractRegion(title: string): string | null {
  const match = title.match(/\((Indonesia|Malaysia|Brazil|Global|PH|SG|TH|ID|MY|BR)\)/i);
  if (!match) return null;
  const raw = match[1].toLowerCase();
  if (raw === "indonesia" || raw === "id") return "Indonesia";
  if (raw === "malaysia" || raw === "my") return "Malaysia";
  if (raw === "brazil" || raw === "br") return "Brazil";
  if (raw === "global") return "Global";
  return match[1];
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  isLoading,
  products,
  selectedProduct,
  setSelectedProduct,
  productRef,
  role,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Detect all available regions in the current product list
  const availableRegions = useMemo(() => {
    const regionMap = new Map<string, number>();
    for (const p of products) {
      const reg = extractRegion(p.title);
      if (reg) {
        regionMap.set(reg, (regionMap.get(reg) || 0) + 1);
      }
    }
    return Array.from(regionMap.entries()).map(([region, count]) => ({
      region,
      count,
    }));
  }, [products]);

  // Set default region to "Indonesia" if Indonesia and other regions exist
  const hasMultipleRegions = availableRegions.length > 1;
  useEffect(() => {
    if (hasMultipleRegions) {
      const hasIndo = availableRegions.some((r) => r.region === "Indonesia");
      if (hasIndo) {
        setSelectedRegion("Indonesia");
      }
    } else {
      setSelectedRegion("ALL");
    }
  }, [hasMultipleRegions, availableRegions]);

  // Filter products by region and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Region filter
      if (selectedRegion !== "ALL") {
        const prodRegion = extractRegion(product.title);
        // Include products specifically for this region OR universal products without region tags
        if (prodRegion && prodRegion !== selectedRegion) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesDesc = (product.description || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [products, selectedRegion, searchQuery]);

  // Group products by category and sort by price ascending
  const groupedCategories = useMemo(() => {
    const groups: Record<CategoryKey, Product[]> = {
      reguler: [],
      pass: [],
      promo: [],
      other: [],
    };

    for (const product of filteredProducts) {
      const cat = categorizeProduct(product);
      groups[cat].push(product);
    }

    // Sort products by ascending price inside each category
    for (const key of Object.keys(groups) as CategoryKey[]) {
      groups[key].sort((a, b) => {
        const priceA = getPriceByRole(a, role);
        const priceB = getPriceByRole(b, role);
        if (priceA !== priceB) return priceA - priceB;
        return a.title.localeCompare(b.title);
      });
    }

    return CATEGORY_ORDER.filter((key) => groups[key].length > 0).map((key) => {
      const items = groups[key];
      const minPrice = items.reduce((min, p) => {
        const pr = getPriceByRole(p, role);
        return pr < min ? pr : min;
      }, Infinity);

      return {
        meta: CATEGORY_META[key],
        items,
        minPrice: minPrice === Infinity ? 0 : minPrice,
      };
    });
  }, [filteredProducts, role]);

  // Determine active category for selectedProduct
  const selectedProductCat = useMemo(() => {
    if (!selectedProduct) return null;
    const found = products.find((p) => String(p.id) === String(selectedProduct));
    return found ? categorizeProduct(found) : null;
  }, [products, selectedProduct]);

  // Initialize or adjust open accordions
  useEffect(() => {
    if (searchQuery.trim()) {
      // Open all matching sections during search
      setOpenSections(groupedCategories.map((g) => g.meta.key));
      return;
    }

    if (groupedCategories.length === 0) {
      setOpenSections([]);
      return;
    }

    // If a product is selected, ensure its category is open
    if (selectedProductCat) {
      setOpenSections((prev) => {
        if (!prev.includes(selectedProductCat)) {
          return [...prev, selectedProductCat];
        }
        return prev.length > 0 ? prev : [selectedProductCat];
      });
      return;
    }

    // Default open: first category
    setOpenSections((prev) => {
      if (prev.length === 0 && groupedCategories.length > 0) {
        return [groupedCategories[0].meta.key];
      }
      return prev;
    });
  }, [searchQuery, selectedProductCat, groupedCategories]);

  const renderProductCard = (product: Product) => {
    const isSelected = String(selectedProduct) === String(product.id);
    const price = getPriceByRole(product, role);
    const promoPrice = product.promo_price ?? null;
    const isPromo = promoPrice !== null && promoPrice !== undefined;
    const disc =
      isPromo && price > promoPrice ? Math.round(((price - promoPrice) / price) * 100) : 0;
    const finalPrice = isPromo ? promoPrice : price;
    const region = extractRegion(product.title);
    const logoUrl = product.logo || product.images;

    return (
      <label
        key={product.id}
        className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border p-3.5 transition-all duration-200 ${
          isSelected
            ? "border-my-color bg-my-color/5 ring-my-color shadow-[0_0_12px_rgba(249,115,22,0.15)] ring-1"
            : "bg-card hover:border-my-color/40 hover:bg-muted/40 border-border/60 shadow-sm"
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

        {/* Top bar: title + radio indicator */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`line-clamp-2 text-xs font-semibold leading-tight ${
                  isSelected ? "text-my-color font-bold" : "text-card-foreground"
                }`}
              >
                {product.title}
              </span>
              {region && (
                <span className="bg-muted py-0.2 text-muted-foreground border-border/50 inline-flex items-center rounded border px-1.5 text-[9px] font-medium">
                  {region}
                </span>
              )}
            </div>
          </div>

          <div
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
              isSelected
                ? "border-my-color bg-my-color ring-my-color/20 text-white ring-2"
                : "border-muted-foreground/30 bg-background group-hover:border-my-color/50"
            }`}
          >
            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
          </div>
        </div>

        {/* Visual / icon badge row if logo available */}
        {logoUrl && (
          <div className="my-1.5 flex items-center gap-1.5">
            <Image
              src={logoUrl}
              alt={product.title}
              width={20}
              height={20}
              className="h-5 w-5 shrink-0 object-contain"
            />
            {product.description && (
              <span className="text-muted-foreground line-clamp-1 text-[10px]">
                {product.description}
              </span>
            )}
          </div>
        )}

        {/* Pricing row */}
        <div className="border-border/40 mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex flex-col">
            {isPromo && (
              <span className="text-muted-foreground text-[10px] leading-tight line-through">
                Rp {price.toLocaleString("id-ID")}
              </span>
            )}
            <span
              className={`text-sm font-bold tracking-tight ${
                isSelected ? "text-my-color" : "text-foreground"
              }`}
            >
              Rp {finalPrice.toLocaleString("id-ID")}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {disc > 0 && (
              <span className="bg-my-color/15 border-my-color/30 text-my-color rounded border px-1.5 py-0.5 text-[9px] font-bold">
                -{disc}%
              </span>
            )}
            <div className="shadow-2xs rounded bg-white/95 p-0.5">
              <LogoInstan className="h-2.5 w-10" />
            </div>
          </div>
        </div>
      </label>
    );
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-muted min-h-[90px] animate-pulse rounded-xl" />
      ))}
    </div>
  );

  return (
    <section ref={productRef} className="bg-background ring-border rounded-xl shadow-sm ring-1">
      {/* Header bar */}
      <div className="bg-muted border-border/40 flex items-center justify-between rounded-t-xl border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-my-color flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm">
            2
          </div>
          <div>
            <h2 className="text-card-foreground text-sm font-semibold tracking-tight">
              Pilih Produk
            </h2>
            <p className="text-muted-foreground hidden text-[11px] sm:block">
              Pilih paket layanan atau nominal yang diinginkan
            </p>
          </div>
        </div>

        {/* Quick count pill */}
        <span className="bg-background text-muted-foreground border-border/60 rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
          {filteredProducts.length} varian
        </span>
      </div>

      <div className="space-y-4 p-4">
        {/* Filter bar: Region selector & Search input */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {/* Region filter chips (if multiple regions present) */}
          {hasMultipleRegions ? (
            <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <div className="text-muted-foreground flex items-center gap-1 pr-1 text-xs font-medium">
                <Globe className="text-muted-foreground h-3.5 w-3.5" />
                <span className="hidden md:inline">Server:</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRegion("ALL")}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  selectedRegion === "ALL"
                    ? "bg-my-color shadow-xs text-white"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Semua
              </button>
              {availableRegions.map(({ region, count }) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    selectedRegion === region
                      ? "bg-my-color shadow-xs text-white"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <span>
                    {region === "Indonesia"
                      ? "🇮🇩"
                      : region === "Malaysia"
                        ? "🇲🇾"
                        : region === "Brazil"
                          ? "🇧🇷"
                          : "🌐"}
                  </span>
                  <span>{region}</span>
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] ${
                      selectedRegion === region
                        ? "bg-white/20 text-white"
                        : "bg-background text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nominal atau paket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border-border/70 placeholder:text-muted-foreground/60 text-card-foreground focus:border-my-color focus:ring-my-color/20 h-8 w-full rounded-lg border pl-8 pr-7 text-xs transition-all focus:outline-none focus:ring-2"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          renderSkeleton()
        ) : groupedCategories.length === 0 ? (
          <div className="border-border/70 flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
            <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-card-foreground mt-2 text-xs font-semibold">
              Tidak ada varian yang sesuai
            </p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              Coba sesuaikan kata kunci pencarian atau ganti filter server/region.
            </p>
            {(searchQuery || selectedRegion !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRegion("ALL");
                }}
                className="text-my-color mt-3 text-xs font-semibold hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : groupedCategories.length === 1 &&
          groupedCategories[0].items.length <= 8 &&
          !hasMultipleRegions ? (
          // Direct grid if items are very few and only 1 category
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            {groupedCategories[0].items.map(renderProductCard)}
          </div>
        ) : (
          // Accordion view grouping categories
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-3"
          >
            {groupedCategories.map(({ meta, items, minPrice }) => {
              const Icon = meta.icon;
              const isSectionSelected = items.some((p) => String(p.id) === String(selectedProduct));

              return (
                <AccordionItem
                  key={meta.key}
                  value={meta.key}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    isSectionSelected
                      ? "border-my-color/40 bg-card/60"
                      : "border-border/60 bg-muted/20"
                  }`}
                >
                  <AccordionTrigger className="hover:bg-muted/40 [&[data-state=open]>svg]:text-my-color px-4 py-3 transition-colors hover:no-underline">
                    <div className="flex w-full items-center justify-between gap-2 pr-3">
                      <div className="flex items-center gap-2.5 text-left">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${meta.bgColor}`}
                        >
                          <Icon className={`h-4 w-4 ${meta.iconColor}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-card-foreground text-xs font-semibold sm:text-sm">
                              {meta.label}
                            </span>
                            <span className="text-muted-foreground bg-muted border-border/40 py-0.2 rounded-full border px-2 text-[10px] font-medium">
                              {items.length}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-[11px]">
                            Mulai Rp {minPrice.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      {isSectionSelected && (
                        <span className="bg-my-color/10 border-my-color/30 text-my-color hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline-flex">
                          <Check className="h-3 w-3" /> Dipilih
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                      {items.map(renderProductCard)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </section>
  );
};

export default ProductSelection;
