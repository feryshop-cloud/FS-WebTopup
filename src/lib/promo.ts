import { db, products, sqlClient } from "@/lib/db";
import { eq } from "drizzle-orm";

/**
 * Union type representing the result of a promo code validation check.
 */
export type PromoValidation =
  | {
      ok: true;
      code: string;
      discount: number;
      discountType: string;
      discountValue: number;
      minOrder: number;
      maxDiscount: number;
    }
  | { ok: false; err: string; message: string };

/**
 * Maps internal promo validation error codes to user-facing Indonesian error messages.
 */
function errMessage(err: string, code: string): string {
  switch (err) {
    case "not_found":
      return "Kode promo tidak valid";
    case "inactive":
      return `Kode promo ${code} sedang tidak aktif`;
    case "not_started":
      return `Kode promo ${code} belum berjalan`;
    case "expired":
      return `Kode promo ${code} sudah kadaluarsa`;
    case "min_order":
      return `Minimal transaksi untuk kode ini belum terpenuhi`;
    case "quota":
      return `Kode promo ${code} sudah habis digunakan`;
    default:
      return "Kode promo tidak dapat digunakan";
  }
}

/**
 * Validates a promo voucher code against the subtotal amount via Postgres RPC `validate_promo`.
 *
 * @param code - Voucher promo code entered by user.
 * @param subtotal - Base transaction total before discount.
 * @returns Promise resolving to `PromoValidation` result object.
 */
export async function callValidatePromo(code: string, subtotal: number): Promise<PromoValidation> {
  // Server-side, pakai pool penuh (postgres). Masih lewat fungsi validate_promo
  // (satu-satunya pintu baca yang benar, konsisten dgn RPC storefront).
  const rows = await sqlClient<{ r: any }[]>`
    select public.validate_promo(${code}::text, ${subtotal}::numeric) as r
  `;
  const r = rows?.[0]?.r as
    | {
        ok?: boolean;
        err?: string;
        code?: string;
        discount?: number;
        discount_type?: string;
        discount_value?: number;
        min_order?: number;
        max_discount?: number;
      }
    | undefined;

  if (!r || !r.ok) {
    const err = r?.err || "not_found";
    return { ok: false, err, message: errMessage(err, code) };
  }

  return {
    ok: true,
    code: r.code ?? code,
    discount: Math.max(0, Math.floor(Number(r.discount ?? 0))),
    discountType: r.discount_type ?? "percent",
    discountValue: Number(r.discount_value ?? 0),
    minOrder: Number(r.min_order ?? 0),
    maxDiscount: Number(r.max_discount ?? 0),
  };
}

/**
 * Fetches the authoritative unit price of a product directly from the database.
 * Favors `promoPrice` if greater than zero, otherwise falls back to `sellingPrice`.
 *
 * @param productId - Unique UUID string of the target product.
 * @returns Resolves to price number in IDR, or `null` if product is not found.
 */
export async function getProductUnitPrice(productId: string): Promise<number | null> {
  try {
    const rows = await db
      .select({ sellingPrice: products.sellingPrice, promoPrice: products.promoPrice })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    const p = rows?.[0];
    if (!p) return null;
    const promo = Number(p.promoPrice ?? 0);
    if (promo > 0) return Math.floor(promo);
    return Math.floor(Number(p.sellingPrice ?? 0));
  } catch {
    return null;
  }
}

/**
 * Computes the final discount amount given a subtotal and promo rule set.
 * Caps percentage discounts to `maxDiscount` if specified.
 *
 * @param subtotal - Total transaction amount.
 * @param promo - Promo rule properties (type, value, max discount cap).
 * @returns Calculated discount integer in IDR (guaranteed to be >= 0 and <= subtotal).
 */
export function computeDiscount(
  subtotal: number,
  promo: { discountType: string; discountValue: number; maxDiscount: number },
): number {
  let discount = 0;
  if (promo.discountType === "percent") {
    discount = Math.floor((subtotal * promo.discountValue) / 100);
    if (promo.maxDiscount > 0 && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else {
    discount = promo.discountValue;
  }
  return Math.max(0, Math.min(discount, subtotal));
}
