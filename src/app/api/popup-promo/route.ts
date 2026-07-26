import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      id: 1,
      title: "Selamat Datang di Feryshop!",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
      description: "Nikmati kemudahan top up game 24 jam dengan harga termurah & proses instan.",
      url: "/order/mobile-legends",
      is_active: false, // Set false default agar popup tidak terus-menerus mengganggu saat dev, pengguna bisa aktifkan di admin
    },
  }, { status: 200 });
}