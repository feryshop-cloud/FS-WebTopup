import { RefObject } from "react";
import { Info } from "lucide-react";

interface ContactDetailsProps {
  whatsappRef: RefObject<HTMLDivElement | null>;
  whatsapp: string;
  setWhatsapp: (whatsapp: string) => void;
  stepNumber?: number;
  sectionId?: string;
}

export default function ContactDetails({
  whatsappRef,
  whatsapp,
  setWhatsapp,
  stepNumber,
  sectionId,
}: ContactDetailsProps) {
  const step =
    Number.isFinite(Number(stepNumber)) && Number(stepNumber) > 0
      ? Math.floor(Number(stepNumber))
      : 5;
  const resolvedSectionId = sectionId ? String(sectionId) : String(step);

  return (
    <section
      id={resolvedSectionId}
      className="bg-background ring-border relative scroll-mt-20 rounded-xl shadow-sm ring-1 md:scroll-mt-[7.5rem]"
    >
      <div className="bg-muted flex items-center rounded-t-xl px-4 py-2">
        <div className="bg-my-color flex h-8 w-8 items-center justify-center rounded-md font-semibold text-white">
          {step}
        </div>
        <h2 className="text-card-foreground ml-3 text-sm font-semibold">Detail Kontak</h2>
      </div>

      <div className="space-y-4 p-4">
        <div ref={whatsappRef} className="space-y-1">
          <label htmlFor="whatsapp" className="text-foreground block text-xs font-medium">
            No. WhatsApp
          </label>
          <div className="flex">
            <span className="border-border/50 bg-muted inline-flex items-center justify-center rounded-s-lg border px-3 text-xs">
              <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 513 342">
                  <title>ID</title>
                  <path fill="#FFF" d="M0 0h513v342H0z" />
                  <path fill="#E00" d="M0 0h513v171H0z" />
                </svg>
              </span>
            </span>
            <input
              id="whatsapp"
              type="tel"
              placeholder="628XXXXXXXX"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
              className="border-border bg-muted text-foreground placeholder-muted-foreground focus:ring-my-color w-full rounded-e-lg border px-4 py-3 text-xs focus:outline-none focus:ring-2"
            />
          </div>
          <span className="text-muted-foreground text-[11px] italic">
            **Nomor ini akan dihubungi jika terjadi masalah
          </span>
        </div>

        <div className="border-border bg-muted/40 text-card-foreground flex w-fit items-center gap-2 rounded-md border px-4 py-2 text-xs">
          <Info className="h-4 w-4" />
          <span>Bukti transaksi akan dikirim ke whatsapp di atas</span>
        </div>
      </div>
    </section>
  );
}
