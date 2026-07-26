import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: any) {
  const slug = context?.params?.slug;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ message: "Slug tidak ditemukan" }, { status: 400 });
  }

  const pages: Record<string, any> = {
    "syarat-dan-ketentuan": {
      title: "Syarat dan Ketentuan",
      content: "<p>Selamat datang di Feryshop. Dengan bertransaksi di platform kami, Anda menyetujui seluruh syarat dan ketentuan yang berlaku di situs ini.</p><p>Semua transaksi yang telah berhasil diproses tidak dapat dibatalkan atau dikembalikan kecuali terjadi kesalahan dari sistem layanan kami.</p>",
    },
    "kebijakan-privasi": {
      title: "Kebijakan Privasi",
      content: "<p>Kami sangat menghargai privasi data Anda. Nomor WhatsApp, email, dan ID game yang Anda masukkan saat bertransaksi hanya digunakan untuk memproses pesanan dan mengirimkan bukti pembayaran.</p>",
    },
    "hubungi-kami": {
      title: "Hubungi Kami",
      content: "<p>Jika Anda mengalami kendala saat bertransaksi, silakan hubungi Customer Service kami melalui WhatsApp yang tertera di halaman bawah (Footer) atau email ke support@feryshop.id. Layanan CS beroperasi 24 Jam.</p>",
    },
  };

  const foundPage = pages[slug] || {
    title: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    content: `<p>Halaman ${slug} sedang dalam pembaruan oleh tim Feryshop.</p>`,
  };

  return NextResponse.json({
    success: true,
    data: foundPage,
  }, { status: 200 });
}
