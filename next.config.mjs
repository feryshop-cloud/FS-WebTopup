/** @type {import('next').NextConfig} */

const apiUrl = process.env.NEXT_PRIVATE_API_URL
  ? new URL(process.env.NEXT_PRIVATE_API_URL).hostname
  : null;

const nextConfig = {
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
    domains: [
      "127.0.0.1",
      "localhost",
      "images.unsplash.com",
      "assets.tripay.co.id",
      "tripay.co.id",
      "assets.tokopay.id",
      "paydisini.co.id",
      "api.qrispy.id",
      "api.dompetx.com",
      "res.cloudinary.com",
      "cdn.jsdelivr.net",
      ...(apiUrl ? [apiUrl] : []),
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
};

export default nextConfig;