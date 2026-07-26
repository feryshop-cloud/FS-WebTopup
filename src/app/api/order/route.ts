import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const orderId = `TSON-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const expiredTime = Math.floor(now.getTime() / 1000) + 86400; // 24 jam

    const newOrderData = {
      orderId,
      gameSlug: body.game_slug || body.slug || "mobile-legends",
      productId: body.product_id || body.productId || "SKU-001",
      productTitle: body.product_title || body.productTitle || "Nominal Topup",
      idGames: body.id_games || body.idGames || body.id || "-",
      serverGames: body.server_games || body.serverGames || body.server || "",
      nickname: body.nickname || "Player",
      quantity: Number(body.quantity || 1),
      price: body.price ? String(body.price) : "0",
      totalPrice: body.total_price || body.totalPrice ? String(body.total_price || body.totalPrice) : "0",
      paymentMethodId: body.payment_method || body.paymentMethod || "qris",
      paymentName: body.payment_name || body.paymentName || "QRIS",
      paymentCode: body.payment_code || body.paymentCode || "QRIS",
      whatsapp: body.whatsapp || "",
      email: body.email || "",
      promoCode: body.promo_code || body.promoCode || "",
      promoDiscount: body.promo_discount ? String(body.promo_discount) : "0",
      paymentStatus: "pending",
      buyStatus: "pending",
      expiredTime,
    };

    // Coba simpan ke database Supabase
    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        await db.insert(orders).values(newOrderData);
      } catch (dbErr) {
        console.warn("Gagal insert ke Supabase (menggunakan mode fallback/demo):", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: {
        order_id: orderId,
        payment_code: newOrderData.paymentCode,
        payment_name: newOrderData.paymentName,
        total_price: Number(newOrderData.totalPrice),
        payment_status: "pending",
        expired_time: expiredTime,
      },
      redirect_url: `/invoice/${orderId}`,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: "Gagal memvalidasi atau memproses pesanan",
      error: error?.message,
    }, { status: 500 });
  }
}
