import { HomePageClient } from "@/components/home/home-page-client";
import { getHomeFallbackData } from "@/lib/data/home";

export default async function HomePage() {
  const initialData = await getHomeFallbackData();

  return <HomePageClient initialData={initialData} />;
}
