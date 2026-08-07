/** Feature-flag harga member/gold/platinum. Default OFF (harga publik tunggal). */
export const MEMBER_PRICE_FLAG = false;

export interface PriceableProduct {
  selling_price: number | string;
  selling_price_gold?: number | string | null;
  selling_price_platinum?: number | string | null;
}

/** Harga efektif produk berdasar role; saat flag false selalu `selling_price`. */
export const getPriceByRole = (
  p: PriceableProduct | null | undefined,
  role?: string | null,
): number => {
  if (!p) return 0;
  if (!MEMBER_PRICE_FLAG) return Number(p.selling_price ?? 0);
  if (role === "gold") return Number(p.selling_price_gold ?? p.selling_price);
  if (role === "platinum") return Number(p.selling_price_platinum ?? p.selling_price);
  return Number(p.selling_price ?? 0);
};