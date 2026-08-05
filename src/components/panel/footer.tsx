import Link from "next/link";
import { useSettings } from "@/context/settings-context";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { FaFacebook as Facebook, FaInstagram as Instagram } from "react-icons/fa";

export function Footer() {
  interface Settings {
    data: {
      ["general.logo"]?: string;
      ["general.title"]?: string;
      ["seo.description"]?: string;
      ["sosmed.fb"]?: string;
      ["sosmed.ig"]?: string;
      ["footer.credit_text"]?: string;
      ["footer.extra_section.title"]?: string;
      ["footer.extra_section.links"]?: Array<{ label?: string; url?: string }>;
    };
  }

  const settings = useSettings() as unknown as Settings | null;

  const logoUrl = settings?.data?.["general.logo"];
  const logoTitle = settings?.data?.["general.title"];

  const extraTitle = settings?.data?.["footer.extra_section.title"] || "";
  const rawLinks = settings?.data?.["footer.extra_section.links"];
  const extraLinks = Array.isArray(rawLinks)
    ? rawLinks
        .map((x) => ({
          label: (x?.label || "").trim(),
          url: (x?.url || "").trim(),
        }))
        .filter((x) => x.label && x.url)
    : [];

  const isExternal = (url: string) => /^https?:\/\//i.test(url);

  return (
    <footer className="mt-8 border-t border-[#242428] bg-[#0F0F0F] text-[#FAFAFA] sm:mt-16 print:hidden">
      <div className="container mx-auto px-4 py-6 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 gap-4 pb-3 sm:gap-8 sm:pb-6 md:grid-cols-3">
          <div className="space-y-2 sm:space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F0F0F] p-1 ring-1 ring-[#242428] sm:h-11 sm:w-11 sm:p-1.5">
                <Image
                  src="/logo-2.png"
                  alt="Feryshop Logo"
                  width={40}
                  height={40}
                  priority
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-[#FAFAFA] sm:text-2xl">
                Feryshop
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-[#A2A2AB] sm:text-sm">
              {settings?.data?.["seo.description"] ||
                "Marketplace Akun Game Sultan & Layanan Top Up Game Terpercaya."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-xs font-semibold text-[#FAFAFA] sm:text-base">Menu</h3>
              <ul className="mt-2 space-y-1 text-xs text-[#A2A2AB] sm:mt-3 sm:space-y-2 sm:text-sm">
                <li>
                  <Link href="/" className="hover:text-primary transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace" className="hover:text-primary transition-colors">
                    Daftar Akun
                  </Link>
                </li>
                <li>
                  <Link href="/price-list" className="hover:text-primary transition-colors">
                    Daftar Harga
                  </Link>
                </li>
                <li>
                  <Link href="/invoices" className="hover:text-primary transition-colors">
                    Cek Invoice
                  </Link>
                </li>
                <li>
                  <Link href="/ulasan-produk" className="hover:text-primary transition-colors">
                    Ulasan Produk
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">
                    Hubungi Kami
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#FAFAFA] sm:text-base">Ikuti Kami</h3>
              <div className="mt-2 flex space-x-3 sm:mt-3 sm:space-x-4">
                <Link
                  href={settings?.data?.["sosmed.fb"] || "https://m.facebook.com/"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary text-[#A2A2AB] transition-colors"
                >
                  <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <Link
                  href={settings?.data?.["sosmed.ig"] || "https://instagram.com/"}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary text-[#A2A2AB] transition-colors"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>
            </div>
          </div>

          {extraLinks.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-[#FAFAFA] sm:text-base">
                {extraTitle || "Lainnya"}
              </h3>
              <ul className="mt-2 space-y-1 text-xs text-[#A2A2AB] sm:mt-3 sm:space-y-2 sm:text-sm">
                {extraLinks.map((item, idx) => (
                  <li key={`${item.url}-${idx}`}>
                    <Link
                      href={item.url}
                      target={isExternal(item.url) ? "_blank" : undefined}
                      rel={isExternal(item.url) ? "noreferrer" : undefined}
                      className="hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="my-3 border-t border-[#242428] sm:my-6" />

        <div className="flex items-center justify-center py-1 text-xs text-[#A2A2AB] sm:justify-start sm:py-2">
          <p>© {new Date().getFullYear()} Feryshop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
