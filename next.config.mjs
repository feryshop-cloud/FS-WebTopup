/** @type {import('next').NextConfig} */

const routePrefix = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath =
  routePrefix && routePrefix !== "/" ? `/${routePrefix.replace(/^\/+|\/+$/g, "")}` : undefined;
const adminDashboardOrigin = process.env.ADMIN_DASHBOARD_ORIGIN?.replace(/\/+$/, "");

let supabaseHostname = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    supabaseHostname = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {}
}

const isDev = process.env.NODE_ENV !== "production";

const nextConfig = {
  output: "standalone",
  ...(basePath ? { basePath } : {}),
  poweredByHeader: false,
  experimental: {},

  images: {
    localPatterns: [
      {
        pathname: "/**",
      },
    ],
    imageSizes: [
      16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 96, 120, 128, 192, 256, 300, 384, 640, 1280,
    ],
    remotePatterns: [
      // 1. Supabase Storage (Wildcard & Dynamic URL)
      { protocol: "https", hostname: "*.supabase.co" },
      ...(supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname }] : []),

      // 2. Railway Storage & Deployment
      { protocol: "https", hostname: "*.up.railway.app" },
      { protocol: "https", hostname: "*.railway.app" },

      // 3. Known CDN & Image Providers
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "cdn.jsdelivr.net" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "moogold.com" },

      // 4. Local Development
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },

      // 5. Fallback wildcard for local dev environment only
      ...(isDev
        ? [
            { protocol: "https", hostname: "**" },
            { protocol: "http", hostname: "**" },
          ]
        : []),
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Powered-By", value: "PT. Ferdi Ananda Store" }],
      },
    ];
  },

  async rewrites() {
    if (!adminDashboardOrigin) return [];

    return [
      {
        source: "/admin",
        destination: `${adminDashboardOrigin}/admin`,
      },
      {
        source: "/admin/:path*",
        destination: `${adminDashboardOrigin}/admin/:path*`,
      },
    ];
  },
};

export default nextConfig;
