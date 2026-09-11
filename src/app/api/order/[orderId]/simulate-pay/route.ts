import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OrderPaymentStatus, OrderBuyStatus } from "@/types/status";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest, props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  const orderId = params.orderId;

  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Only available in development mode" },
      { status: 403 },
    );
  }

  try {
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.orderId, orderId),
    });

    if (!existingOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Hanya pesanan testing
    const isSandbox =
      existingOrder.gameSlug === "dummy-game" ||
      String(existingOrder.productTitle || "")
        .toLowerCase()
        .includes("xld10");

    if (!isSandbox) {
      return NextResponse.json(
        { success: false, message: "Hanya untuk pesanan testing sandbox" },
        { status: 400 },
      );
    }

    if (existingOrder.paymentStatus === OrderPaymentStatus.PAID) {
      return NextResponse.json(
        { success: false, message: "Pesanan sudah berstatus LUNAS" },
        { status: 400 },
      );
    }

    await db
      .update(orders)
      .set({
        paymentStatus: OrderPaymentStatus.PAID,
        buyStatus: OrderBuyStatus.PROCESSING,
        updatedAt: new Date(),
      })
      .where(eq(orders.orderId, orderId));

    logger.info("sandbox order simulated paid", { orderId });

    return NextResponse.json({
      success: true,
      message: "Simulasi pembayaran lunas berhasil, order kini diproses.",
    });
  } catch (error) {
    logger.error("simulate pay failed", { error, orderId });
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
