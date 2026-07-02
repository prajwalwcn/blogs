import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Globe, Search } from "lucide-react";
import BlogCard from "@/components/public/BlogCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Blog {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  image: { url: string | null; alt: string | null; caption: string | null };
}

async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "All Blog Channels — Expert Knowledge Hubs",
  description:
    "Browse all Web Creation Nepal blog channels covering web design, development, SEO, digital marketing, and technology. Find the right knowledge hub for your needs.",
  keywords: [
    "web design blog Nepal",
    "SEO articles Nepal",
    "web development tutorials",
    "digital marketing blog",
    "tech blog Kathmandu",
  ],
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "Blog Channels | Web Creation Nepal",
    description: "Explore all expert knowledge hubs from Web Creation Nepal.",
    url: "/blogs",
  },
};

function BlogsPageJsonLd({ blogs }: { blogs: Blog[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Web Creation Nepal – Blog Channels",
    description: "Expert knowledge hubs on web design, development, SEO and digital marketing.",
    url: "https://webcreation.com.np/blogs",
    hasPart: blogs.map((blog) => ({
      "@type": "Blog",
      name: blog.name,
      description: blog.description,
      url: `https://webcreation.com.np/blogs/${blog.slug}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function BlogsPage() {
  const blogs = await getBlogs();

  return (
    <>
      <BlogsPageJsonLd blogs={blogs} />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-14 sm:py-20 relative overflow-hidden" aria-labelledby="blogs-page-heading">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
            <Globe className="h-3 w-3" />
            Knowledge Hubs
          </div>
          <h1 id="blogs-page-heading" className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Our Blog Channels
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Each channel covers a specialized domain of knowledge — from technical web development to business growth strategies.
          </p>
        </div>
      </section>

      {/* ── Blogs Grid ──────────────────────────────────────────── */}
      <section className="bg-zinc-50 py-14 sm:py-18" aria-label="Blog channels listing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Count bar */}
          <div className="flex items-center justify-between mb-8">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {blogs.length} {blogs.length === 1 ? "Channel" : "Channels"} available
            </p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-300 rounded-2xl bg-white">
              <Globe className="h-14 w-14 text-zinc-300 mx-auto mb-4" />
              <h2 className="font-bold text-zinc-700 text-xl mb-2">No Blog Channels Yet</h2>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                New knowledge hubs are being set up. Please check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  id={blog.id}
                  name={blog.name}
                  slug={blog.slug}
                  description={blog.description}
                  image={blog.image}
                  meta_keywords={blog.meta_keywords}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
