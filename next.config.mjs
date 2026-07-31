/** @type {import('next').NextConfig} */

const routePrefix = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const basePath =
  routePrefix && routePrefix !== "/"
    ? `/${routePrefix.replace(/^\/+|\/+$/g, "")}`
    : undefined;
const adminDashboardOrigin = process.env.ADMIN_DASHBOARD_ORIGIN?.replace(/\/+$/, "");

const nextConfig = {
  output: "standalone",
  ...(basePath ? { basePath } : {}),
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Powered-By", value: "PT. Ferdi Ananda Store" },
        ],
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
