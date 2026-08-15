import { HomePageClient } from "@/components/home/home-page-client";
import { getHomeFallbackData } from "@/lib/data/home";

// ISR: route home di-revalidate tiap 30 detik. Akun marketplace yang baru laku
// terpurge seketika via revalidateTag("marketplace-accounts") pada webhook
// pembayaran sukses, sehingga stok akun sultan tidak kedouble-order.
export const revalidate = 30;

export default async function HomePage() {
  const initialData = await getHomeFallbackData();
  return <HomePageClient initialData={initialData} />;
}
