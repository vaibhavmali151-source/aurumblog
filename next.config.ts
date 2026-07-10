import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // gzip/brotli response compression
  output: "standalone",
  typescript: {
    // Type-check is a separate CI step; the build must never fail on inferred-any
    // when Prisma's client types can't be generated (e.g. offline installs).
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // allow any https image host for cover images pasted by editors
    ],
  },
  async headers() {
    return [
      {
        // Long-lived caching for uploaded/static assets; CDN-ready.
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
