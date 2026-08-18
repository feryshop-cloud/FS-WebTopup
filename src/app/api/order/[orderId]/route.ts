import { NextResponse } from "next/server";
import { db, orders, games, products } from "@/lib/db";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import { OrderPaymentStatus } from "@/types/status";

export const dynamic = "force-dynamic";

async function getHandler(req: Request, context?: RouteContext<"/api/order/[orderId]">) {
  try {
    const { orderId } = (await context?.params) ?? { orderId: undefined };
    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID tidak ditemukan" },
        { status: 400 },
      );
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
          const nowSec = Math.floor(Date.now() / 1000);
          let currentPaymentStatus = o.paymentStatus;

          // Lazy Expire: Jika status PENDING dan expiredTime sudah lewat, update ke EXPIRED di DB
          if (
            currentPaymentStatus === OrderPaymentStatus.PENDING &&
            o.expiredTime &&
            o.expiredTime <= nowSec
          ) {
            try {
              await db
                .update(orders)
                .set({ paymentStatus: OrderPaymentStatus.EXPIRED })
                .where(eq(orders.orderId, orderId));
              currentPaymentStatus = OrderPaymentStatus.EXPIRED;
              logger.info("order lazy-expired on GET invoice", {
                orderId,
                expiredTime: o.expiredTime,
              });
            } catch (lazyErr) {
              logger.error("failed to lazy-expire order on GET invoice", {
                orderId,
                error: lazyErr,
              });
            }
          }

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
            payment_method: o.paymentMethodId || o.paymentName || "",
            payment_code: o.paymentCode,
            payment_code_display: o.paymentCodeDisplay,
            qr_string: o.qrString,
            payment_status: currentPaymentStatus,
            buy_status: o.buyStatus,
            serial_number: o.serialNumber,
            whatsapp: o.whatsapp,
            email: o.email,
            created_at: o.createdAt,
            expired_time: o.expiredTime,
            gateway_response: o.gatewayResponse,
          };

          const dbGame = await db.select().from(games).where(eq(games.slug, o.gameSlug)).limit(1);
          if (dbGame && dbGame[0]) gameData = dbGame[0];

          const dbProduct = await db
            .select()
            .from(products)
            .where(eq(products.id, o.productId))
            .limit(1);
          if (dbProduct && dbProduct[0]) productData = dbProduct[0];
        }
      } catch (e) {
        logger.warn("order lookup fell back to demo data", {
          orderId,
          error: e,
        });
      }
    }

    // 2. Jika pesanan tidak ditemukan di database
    if (!orderData) {
      return NextResponse.json(
        {
          success: false,
          message: `Data pesanan dengan ID ${orderId} tidak ditemukan.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: orderData,
        game: gameData || {
          title: orderData.game_slug,
          slug: orderData.game_slug,
          image: "/images/ml.png",
        },
        product: productData || { title: orderData.product_title, price: orderData.total_price },
        message: "Data invoice berhasil dimuat",
      },
      { status: 200 },
    );
  } catch (error: any) {
    logger.error("order lookup failed", { error });
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil invoice",
        error: error?.message,
      },
      { status: 500 },
    );
  }
}

export const GET = withRequestLogging(getHandler);
