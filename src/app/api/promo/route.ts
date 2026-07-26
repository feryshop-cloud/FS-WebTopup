import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        title: "Diskon Weekly Pass MLBB",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop",
        description: "Potongan harga spesial untuk Weekly Diamond Pass selama periode promo.",
        url: "/order/mobile-legends",
      },
      {
        id: 2,
        title: "Cashback QRIS 5%",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop",
        description: "Gunakan metode pembayaran QRIS untuk mendapatkan potongan langsung.",
        url: "/order/valorant",
      },
    ],
  }, { status: 200 });
}