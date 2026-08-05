import { NextResponse } from "next/server";
import { db, orders } from "@/lib/db";
import { desc } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { withRequestLogging } from "@/lib/logging/with-request-logging";
import {
  BuyStatus,
  PaymentStatus,
  VALID_BUY_STATUSES,
  VALID_PAYMENT_STATUSES,
} from "@/types/status";

export const dynamic = "force-dynamic";

async function getHandler() {
  try {
    if (!process.env.DATABASE_URL && !process.env.SUPABASE_DB_URL) {
      return NextResponse.json(
        { success: false, message: "Database tidak terkonfigurasi" },
        { status: 500 },
      );
    }

    const dbOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(15);

    const results = dbOrders.map((o) => {
      if (!o.orderId) {
        logger.warn("realtime-transaction: order missing order_id", { id: o.id });
      }

      const buyStatus = (o.buyStatus || "pending") as BuyStatus;
      const paymentStatus = (o.paymentStatus || "pending") as PaymentStatus;

      if (!VALID_BUY_STATUSES.includes(buyStatus)) {
        logger.warn("realtime-transaction: invalid buy_status", {
          id: o.id,
          buyStatus: o.buyStatus,
        });
      }
      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        logger.warn("realtime-transaction: invalid payment_status", {
          id: o.id,
          paymentStatus: o.paymentStatus,
        });
      }

      const nick = o.nickname || "Player";
      const maskedNick = nick.length > 2 ? `${nick[0]}***${nick[nick.length - 1]}` : "P***r";

      return {
        id: o.id,
        order_id: o.orderId,
        nickname: maskedNick,
        game: o.gameSlug,
        product: o.productTitle,
        buy_status: buyStatus,
        payment_status: paymentStatus,
        total_price: o.totalPrice,
        whatsapp: o.whatsapp,
        created_at: o.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: results }, { status: 200 });
  } catch (err: unknown) {
    logger.error("realtime-transaction failed", { error: err });
    return NextResponse.json(
      { success: false, message: "Gagal memuat transaksi realtime" },
      { status: 500 },
    );
  }
}

export const GET = withRequestLogging(getHandler);
