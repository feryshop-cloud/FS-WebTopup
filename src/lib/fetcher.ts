import { withBasePath } from "@/lib/routes";

export const fetcher = async (url: string) => {
  const res = await fetch(withBasePath(url));

  if (!res.ok) {
    throw new Error(`Gagal mengambil data. Status: ${res.status}`);
  }

  return res.json();
};
