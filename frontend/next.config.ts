import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/blog",
  images: {
    remotePatterns: [
      // Allow any external image source (localhost dev, Unsplash, CDN, production storage)
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/storage/:path*",
        destination: `${backendUrl}/storage/:path*`,
      },
    ];
  },
};

export default nextConfig;

