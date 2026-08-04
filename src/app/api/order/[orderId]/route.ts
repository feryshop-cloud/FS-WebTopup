import { NextResponse } from "next/server";
import { db, orders, games, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { seedGames, seedProducts } from "@/lib/db/seed-data";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";

type Params = { orderId: string };

export const dynamic = "force-dynamic";

async function getHandler(req: Request, context: { params: Promise<Params> }) {
  try {
    const { orderId } = await context.params;
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID tidak ditemukan" }, { status: 400 });
    }

    let orderData: any = null;
    let gameData: any = null;
    let productData: any = null;

    // 1. Coba cari di Supabase
    if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
      try {
        const dbOrder = await db.select().from(orders).where(eq(orders.orderId, orderId)).limit(1);
        if (dbOrder && dbOrder[0]) {
          const o = dbOrder[0];
          orderData = {
            order_id: o.orderId,
            user_id: o.userId,
            game_slug: o.gameSlug,
            product_id: o.productId,
            product_title: o.productTitle,
            id_games: o.idGames,
            server_games: o.serverGames,
            nickname: o.nickname,
            quantity: o.quantity,
            price: Number(o.price),
            total_price: Number(o.totalPrice),
            payment_name: o.paymentName,
            payment_code: o.paymentCode,
            payment_status: o.paymentStatus,
            buy_status: o.buyStatus,
            serial_number: o.serialNumber,
            whatsapp: o.whatsapp,
            email: o.email,
            created_at: o.createdAt,
            expired_time: o.expiredTime,
          };

          const dbGame = await db.select().from(games).where(eq(games.slug, o.gameSlug)).limit(1);
          if (dbGame && dbGame[0]) gameData = dbGame[0];

          const dbProduct = await db.select().from(products).where(eq(products.id, o.productId)).limit(1);
          if (dbProduct && dbProduct[0]) productData = dbProduct[0];
        }
      } catch (e) {
        logger.warn("order lookup fell back to demo data", {
          orderId,
          error: e,
        });
      }
    }

    // 2. Fallback demo order jika tidak ditemukan di DB
    if (!orderData) {
      orderData = {
        order_id: orderId,
        game_slug: "mobile-legends",
        product_id: "ML-86",
        product_title: "86 Diamonds (78 + 8 Bonus)",
        id_games: "12345678",
        server_games: "1234",
        nickname: "Feryshop Player",
        quantity: 1,
        price: 23500,
        total_price: 23500,
        payment_name: "QRIS (All Bank & E-Wallet)",
        payment_code: "QRIS",
        payment_status: "pending",
        buy_status: "pending",
        whatsapp: "081234567890",
        created_at: new Date().toISOString(),
        expired_time: Math.floor(Date.now() / 1000) + 86400,
      };

      gameData = seedGames[0];
      productData = seedProducts['mobile-legends'][0];
    }

    return NextResponse.json({
      success: true,
      order: orderData,
      game: gameData || { title: orderData.game_slug, slug: orderData.game_slug, image: "/images/ml.png" },
      product: productData || { title: orderData.product_title, price: orderData.total_price },
      message: "Data invoice berhasil dimuat",
    }, { status: 200 });
  } catch (error: any) {
    logger.error("order lookup failed", { error });
    return NextResponse.json({
      success: false,
      message: "Terjadi kesalahan saat mengambil invoice",
      error: error?.message,
    }, { status: 500 });
  }
}

export const GET = withRequestLogging(getHandler);