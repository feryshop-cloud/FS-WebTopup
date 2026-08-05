import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts direct relative paths (e.g. "/games/image/mlbb-icon.webp") or S3 paths
 * to /api/proxy-image URLs so Next.js Image optimizer can fetch S3 assets without 400 Bad Request.
 */
const KNOWN_LOCAL_ICONS = [
  "mlbb-icon.webp",
  "ff-icon.webp",
  "pubg-icon.webp",
  "genshin-icon.webp",
  "valorant-icon.webp",
  "codm-icon.webp",
  "hok-icon.webp",
  "roblox-icon.webp",
  "logo-topup.webp",
  "logo-1.png",
  "logo-2.png",
  "qris.webp",
  "placeholder.png",
];

export function resolveStorageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  if (/^https?:\/\//i.test(path) || path.startsWith("/api/proxy-image")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fileName = cleanPath.split("/").pop() || "";

  if (KNOWN_LOCAL_ICONS.includes(fileName)) {
    return `/${fileName}`;
  }

  if (
    !cleanPath.startsWith("/uploads/") &&
    !cleanPath.startsWith("/s3/") &&
    !cleanPath.startsWith("/buckets/") &&
    !cleanPath.startsWith("/storage/")
  ) {
    return cleanPath;
  }

  return `/api/proxy-image?path=${encodeURIComponent(cleanPath)}`;
}
