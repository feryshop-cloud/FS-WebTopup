import { NextResponse } from "next/server";
import { seedGames, seedArticles } from "@/lib/db/seed-data";

export const dynamic = "force-dynamic";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/+$/, "");
  const now = new Date().toISOString();

  const urls: string[] = [
    `${siteUrl}/`,
    `${siteUrl}/price-list`,
    `${siteUrl}/cek-pesanan`,
    `${siteUrl}/kalkulator`,
    `${siteUrl}/blog`,
  ];

  seedGames.forEach((g) => {
    urls.push(`${siteUrl}/order/${g.slug}`);
  });

  seedArticles.forEach((a) => {
    urls.push(`${siteUrl}/blog/${a.slug}`);
  });

  const rows = urls
    .map((u) => `  <url>\n    <loc>${escapeXml(u)}</loc>\n    <lastmod>${escapeXml(now)}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}