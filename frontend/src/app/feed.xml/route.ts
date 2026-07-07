import { NextResponse } from "next/server";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface Blog {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  created_at?: string;
}

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // cache feed for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch blogs from API: ${res.status}`);
    }

    const json = await res.json();
    const blogs: Blog[] = json.data ?? [];

    const feedItems = blogs
      .map((blog) => {
        const url = `${frontendUrl}/blogs/${blog.slug}`;
        const date = blog.created_at ? new Date(blog.created_at).toUTCString() : new Date().toUTCString();
        return `
    <item>
      <title>${escapeXml(blog.name)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escapeXml(blog.excerpt || blog.name)}</description>
    </item>`;
      })
      .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Web Creation Nepal Blog Feed</title>
    <link>${frontendUrl}</link>
    <description>Insights, technical articles, web design, and SEO updates from Web Creation Nepal.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${frontendUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${feedItems}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (err: any) {
    console.error("RSS feed generation failed:", err);
    // Return empty fallback RSS feed instead of throwing a 500 error
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Web Creation Nepal Blog Feed</title>
    <link>${frontendUrl}</link>
    <description>Our blogging portal is temporarily undergoing maintenance.</description>
  </channel>
</rss>`;
    return new Response(fallbackRss, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
