import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/blog";

const nextConfig: NextConfig = {
  basePath: basePath === "/" ? undefined : basePath,
  output: "standalone",
  images: {
    unoptimized: true,
  },

  async headers() {
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval';
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: *;
      font-src 'self' data: https://fonts.gstatic.com;
      frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://google.com;
      connect-src 'self' *;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, " ").trim();

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  async rewrites() {
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    // Normalize backendUrl: strip trailing /api or / to avoid double routing prefixes
    backendUrl = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    return [
      {
        source: "/sitemap.xml",
        destination: `${backendUrl}/sitemap.xml`,
      },
      {
        source: "/robots.txt",
        destination: `${backendUrl}/robots.txt`,
      },
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

