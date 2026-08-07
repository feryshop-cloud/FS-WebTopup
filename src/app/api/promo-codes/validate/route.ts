import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { callValidatePromo, getProductUnitPrice, computeDiscount } from "@/lib/promo";

export const dynamic = "force-dynamic";

const money = (v: any) => Math.max(0, Math.floor(Number(v ?? 0)));

async function postHandler(req: Request) {
  try {
    const body = await req.json();
    const codeInput = String(body.promo_code || body.code || "")
      .trim()
      .toUpperCase();
    const productId = String(body.product_id || body.productId || "");
    const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));

    if (!codeInput) {
      return NextResponse.json(
        { success: false, message: "Kode promo harus diisi" },
        { status: 400 },
      );
    }

    // Harga unit diambil server-side (idempotent) — jangan percaya subtotal client (R1).
    const unitPrice = productId ? await getProductUnitPrice(productId) : null;
    if (productId && unitPrice === null) {
      return NextResponse.json(
        { success: false, message: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }

    const subtotal = unitPrice !== null ? unitPrice * quantity : 0;

    const result = await callValidatePromo(codeInput, subtotal);
    if (!result.ok) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    const discount = computeDiscount(subtotal, result);
    const finalPrice = Math.max(0, subtotal - discount);

    return NextResponse.json(
      {
        success: true,
        message: "Kode promo berhasil digunakan!",
        data: {
          promo: {
            code: result.code,
            discount_type: result.discountType,
            discount_value: result.discountValue,
            min_order: result.minOrder,
            max_discount: result.maxDiscount,
          },
          pricing: {
            discount: money(discount),
            final_price: money(finalPrice),
            subtotal: money(subtotal),
          },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("promo validate failed", { error });
    return NextResponse.json(
      { success: false, message: "Gagal memvalidasi kode promo" },
      { status: 500 },
    );
  }
}

export const POST = withRequestLogging(postHandler);
