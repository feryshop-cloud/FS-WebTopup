import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(_: Request, { params }: Ctx) {
  try {
    const { orderId } = await params;
    return NextResponse.json(
      {
        success: true,
        review: null,
        order_id: orderId,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengambil ulasan." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    const body = await req.json().catch(() => ({}));
    const { orderId } = await params;

    return NextResponse.json(
      {
        success: true,
        message: "Ulasan berhasil dikirim",
        data: {
          order_id: orderId,
          rating: body.rating || 5,
          comment: body.comment || body.review_text || "",
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal mengirim ulasan." },
      { status: 500 },
    );
  }
}
