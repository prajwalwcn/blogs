import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Resolve domain dynamically from request headers or environment variable
  const host = request.headers.get("host") || (process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/^https?:\/\//, "") : "localhost:3000");
  const protocol = host.includes("localhost") ? "http" : "https";
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const content = `# Web Creation Nepal Blog Channel

This directory provides indexing reference paths of Web Creation Nepal's engineering and design insights portal.

## Core Channels
- [All Channels](${frontendUrl}/blogs): Lists all available expert knowledge channels.
- [Dashboard Portal](${frontendUrl}/wcnadmin): Content editing console settings.

## Editorial Coverage
We publish regular articles under three core channels:
- **SEO & Digital Marketing**: Next.js technical SEO metadata, AEO positioning, GEO visibility, and schema markup templates.
- **Web Development**: Laravel API architecture designs, dynamic sitemaps, caching (Sanctum/Redis), and performance audits.
- **Web Design & UX**: Premium layouts, accessible drawer designs, visual contrast standards, and responsive tables styling.

## Context Reference
This portal integrates next-gen Next.js 16 layouts with database-driven Eloquent models from a Laravel backend API, delivering high-performance articles optimized for both web browsers and generative search engines.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
