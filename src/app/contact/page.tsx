"use client";

import { useState } from "react";
import { ContentLayout } from "@/components/panel/content-layout";
import { useSettings } from "@/context/settings-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Contact() {
  interface Settings {
    data: {
      ["sosmed.wa"]?: string;
    };
  }

  const settings = useSettings() as unknown as Settings | null;
  const waNumber = settings?.data?.["sosmed.wa"];

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<{
    type?: string;
    name?: string;
    whatsapp?: string;
    description?: string;
  }>({});

  const handleSubmit = () => {
    const newErrors: typeof errors = {};

    if (!type) newErrors.type = "Tipe harus dipilih.";
    if (!name.trim()) newErrors.name = "Nama harus diisi.";
    if (!whatsapp.trim()) newErrors.whatsapp = "Nomor WhatsApp harus diisi.";
    if (!description.trim()) newErrors.description = "Deskripsi harus diisi.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const phoneNumber = waNumber;
    const message =
      `*Nama:* ${name}\n` +
      `*Tipe:* ${type}\n` +
      `*Nomor WhatsApp:* ${whatsapp}\n` +
      `*Deskripsi:* ${description}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank");
  };

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

              <div className="space-y-4">
                <div>
                  <Select onValueChange={(value) => setType(value)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent className="bg-background text-foreground border-muted">
                      <SelectItem value="Masalah Transaksi">Masalah Transaksi</SelectItem>
                      <SelectItem value="Jasa Website TopUp Game">
                        Jasa Website TopUp Game
                      </SelectItem>
                      <SelectItem value="Permintaan Lain">Permintaan Lain</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
                </div>

                <div>
                  <Input
                    placeholder="Nama Kamu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <Input
                    type="tel"
                    placeholder="Nomor WhatsApp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                  {errors.whatsapp && (
                    <p className="mt-1 text-sm text-red-600">{errors.whatsapp}</p>
                  )}
                </div>

                <div>
                  <Textarea
                    placeholder="Tulis Pesan Kamu..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background min-h-[120px]"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  className="from-my-color to-my-color w-full bg-gradient-to-r font-bold text-white hover:opacity-90"
                >
                  Kirim Pesan
                </Button>

                <p className="text-muted-foreground text-center text-sm">
                  Klik tombol di atas untuk menghubungi kami via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
