import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import BlogCard from "@/components/public/BlogCard";
import CategoryFilter from "@/components/public/CategoryFilter";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
const ITEMS_PER_PAGE = 8; // 2 large cards + 6 small cards (2 rows of 3)

// ── Types ──────────────────────────────────────────────────────────────────
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

interface Blog {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  description?: any;
  meta_keywords?: string | null;
  created_at?: string | null;
  read_time?: number | null;
  author?: {
    id: number;
    name: string;
    avatar_url?: string | null;
  } | null;
  image: { url: string | null; alt: string | null; caption: string | null };
  categories?: Category[];
}

// ── Server-Side Data Fetching ──────────────────────────────────────────────
async function getBlogs(): Promise<Blog[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function getSettings() {
  try {
    const res = await fetch(`${API_URL}/api/settings`, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ── SEO Metadata ───────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings?.site_name || "The Web Creation Blog";
  const tagline = settings?.site_tagline || "Insights, Technology & Culture";
  const title = settings?.meta_title || `${siteName} – ${tagline}`;
  const description = settings?.meta_description || "Our official blog with insights, technology advice, and our culture.";
  const keywords = settings?.meta_keywords ? settings.meta_keywords.split(",").map((k: string) => k.trim()) : ["web creation blog", "web design Nepal", "SEO Nepal", "digital marketing Nepal", "tech blog"];
  
  return {
    title,
    description,
    keywords,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      images: [{ url: settings?.logo_url || "/logo.png", width: 400, height: 120, alt: siteName }],
    },
    twitter: { card: "summary_large_image", title },
  };
}

// ── JSON-LD ────────────────────────────────────────────────────────────────
function JsonLd({ blogs, settings }: { blogs: Blog[]; settings: any }) {
  const baseUrl = "https://demo.webcreationcanada.com/blog";
  const logoUrl = settings?.logo_url || `${baseUrl}/logo.png`;

  const sameAs: string[] = [];
  if (settings?.social_links) {
    const sl = settings.social_links;
    if (sl.facebook) sameAs.push(sl.facebook);
    if (sl.x) sameAs.push(sl.x);
    if (sl.instagram) sameAs.push(sl.instagram);
    if (sl.threads) sameAs.push(sl.threads);
  }

  const schemas = [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": settings?.site_name || "Web Creation Nepal",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": logoUrl
      },
      "sameAs": sameAs
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      "url": baseUrl,
      "name": settings?.site_name || "Web Creation Nepal",
      "publisher": { "@id": `${baseUrl}/#organization` },
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/blogs?search={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${baseUrl}/#breadcrumb`,
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blogs",
          "item": baseUrl
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": `${baseUrl}/#itemlist`,
      "name": "Blog Channels",
      "numberOfItems": blogs.length,
      "itemListElement": blogs.map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "item": {
          "@type": "Blog",
          "name": b.name,
          "description": b.excerpt || b.name,
          "url": `${baseUrl}/blogs/${b.slug}`
        }
      }))
    }
  ];

  const graph = {
    "@context": "https://schema.org",
    "@graph": schemas
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

// ── Page (RSC) ─────────────────────────────────────────────────────────────
interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const [allBlogs, categories, settings] = await Promise.all([
    getBlogs(),
    getCategories(),
    getSettings(),
  ]);
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const currentCategory = resolvedSearchParams.category || "";

  // Filter blogs based on category if selected
  const filteredBlogs = currentCategory
    ? allBlogs.filter((blog) =>
        blog.categories?.some((cat) => cat.slug === currentCategory)
      )
    : allBlogs;

  // Pagination calculation based on filtered list
  const totalItems = filteredBlogs.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Split current page's blogs: first 2 as large/featured, next 6 as small
  const featuredBlogs = paginatedBlogs.slice(0, 2);
  const remainingBlogs = paginatedBlogs.slice(2);

  return (
    <>
      <JsonLd blogs={allBlogs} settings={settings} />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        className="relative bg-gradient-to-br from-[#1a5276] via-[#1f618d] to-[#2e86c1] text-white overflow-hidden animate-in fade-in duration-300"
        aria-labelledby="blog-title"
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <h1
            id="blog-title"
            className="text-3xl sm:text-4xl  mb-3 animate-in fade-in duration-300"
          >
            {settings?.site_name || "The Web Creation Blog"}
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl animate-in fade-in duration-500">
            {settings?.site_tagline || "Our official blog with insights, technology advice, and our culture."}
          </p>
        </div>
      </section>

      {/* ── Blogs Grid ─────────────────────────────────────────── */}
      <section className="bg-zinc-50 pt-6 sm:pt-8 pb-12 sm:pb-16" aria-label="Blog channels">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

          {allBlogs.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-zinc-300 rounded-2xl bg-white">
              <FileText className="h-14 w-14 text-zinc-300 mx-auto mb-4" />
              <h2 className="font-bold text-zinc-700 text-xl mb-2">No Blogs Yet</h2>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                Blog channels are being set up. Check back soon!
              </p>
            </div>
          ) : (
            <>
              {/* Categories horizontal filter */}
              <CategoryFilter categories={categories} currentCategory={currentCategory} />

              {/* ── Top Featured row – 2 large cards ─────────────────── */}
              {featuredBlogs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  {featuredBlogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      id={blog.id}
                      name={blog.name}
                      slug={blog.slug}
                      excerpt={blog.excerpt}
                      description={blog.description}
                      image={blog.image}
                      meta_keywords={blog.meta_keywords}
                      created_at={blog.created_at}
                      author={blog.author}
                      read_time={blog.read_time}
                      size="large"
                    />
                  ))}
                </div>
              )}

              {/* ── Remaining blogs row – 3-column grid ─────────────────── */}
              {remainingBlogs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {remainingBlogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      id={blog.id}
                      name={blog.name}
                      slug={blog.slug}
                      excerpt={blog.excerpt}
                      description={blog.description}
                      image={blog.image}
                      meta_keywords={blog.meta_keywords}
                      created_at={blog.created_at}
                      author={blog.author}
                      read_time={blog.read_time}
                      size="small"
                    />
                  ))}
                </div>
              )}

              {/* ── Pagination ──────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center border-t border-zinc-200 pt-6 mt-8 font-sans">
                  <div className="flex items-center gap-1 text-sm font-semibold text-zinc-600">
                    {/* Previous Button */}
                    {currentPage > 1 ? (
                      <Link
                        href={`/?page=${currentPage - 1}`}
                        className="px-3 py-1.5 hover:text-zinc-900 transition-colors"
                      >
                        Pre
                      </Link>
                    ) : (
                      <span className="px-3 py-1.5 text-zinc-300 cursor-not-allowed select-none">
                        Pre
                      </span>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <Link
                          key={pageNum}
                          href={`/?page=${pageNum}`}
                          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                            isActive
                              ? "bg-[#76a21e] text-white font-bold" // Active page green style
                              : "bg-zinc-200/60 hover:bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}

                    {/* Next Button */}
                    {currentPage < totalPages ? (
                      <Link
                        href={`/?page=${currentPage + 1}`}
                        className="px-3 py-1.5 hover:text-zinc-900 transition-colors"
                      >
                        Next
                      </Link>
                    ) : (
                      <span className="px-3 py-1.5 text-zinc-300 cursor-not-allowed select-none">
                        Next
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
