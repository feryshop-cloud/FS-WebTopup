import type { Metadata } from "next";
import { ContentLayout } from "@/components/panel/content-layout";
import { ContactFormClient } from "@/components/contact/contact-form-client";

export const metadata: Metadata = {
  title: "Feryshop | Hubungi Kami",
  description:
    "Hubungi tim Feryshop untuk bantuan transaksi, laporan masalah, atau permintaan lain. Kami siap membantu 24/7 via WhatsApp.",
  openGraph: {
    title: "Feryshop | Hubungi Kami",
    description:
      "Hubungi tim Feryshop untuk bantuan transaksi, laporan masalah, atau permintaan lain. Kami siap membantu 24/7 via WhatsApp.",
    type: "website",
  },
};

export default function Contact() {
  return (
    <ContentLayout title="Contact">
      <div className="min-h-screen py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 md:flex-row">
            <div className="space-y-6 md:w-1/2">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">Hubungi Kami!</h1>
                <p>
                  Mengalami masalah dengan waktu transaksi? Silakan hubungi kami di bawah ini sesuai
                  dengan kebutuhan Kamu!
                </p>
              </div>
            </div>

            <div className="bg-muted space-y-6 rounded-2xl border p-8 shadow-md md:w-1/2">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">Formulir Laporan / Permintaan</h2>
                <p className="text-sm">
                  Silahkan isi formulir di bawah ini untuk melaporkan masalah yang Kamu alami. Tim
                  kami akan segera menindaklanjuti laporan Kamu.
                </p>
              </div>

              <ContactFormClient />
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
