import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts direct relative paths (e.g. "/games/image/mlbb-icon.webp") or S3 paths
 * to /api/proxy-image URLs so Next.js Image optimizer can fetch S3 assets without 400 Bad Request.
 */
export function resolveStorageUrl(path: string | null | undefined): string {
  if (!path) return "/placeholder.png";
  if (/^https?:\/\//i.test(path) || path.startsWith("/api/proxy-image")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/api/proxy-image?path=${encodeURIComponent(cleanPath)}`;
}

