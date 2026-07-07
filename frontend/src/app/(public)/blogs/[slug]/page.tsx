import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { 
  FileText, 
  Clock, 
  ArrowRightCircle, 
  Calendar,
  PenTool,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import CommentSection from "@/components/public/CommentSection";
import ShareButtons from "@/components/public/ShareButtons";
import TableOfContents from "@/components/public/TableOfContents";
import CategoryList from "@/components/public/CategoryList";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

const formatTableContent = (htmlContent: string) => {
  if (!htmlContent) return "";
  return htmlContent
    .replace(/<table/gi, '<div class="overflow-x-auto w-full border border-zinc-200 rounded-xl my-6"><table class="min-w-full divide-y divide-zinc-200"')
    .replace(/<\/table>/gi, '</table></div>');
};

interface BlogSection {
  title: string;
  content: string;
}

interface BlogData {
  blog: {
    id: number;
    name: string;
    slug: string;
    excerpt?: string | null;
    description: BlogSection[] | string | null;
    read_time?: number | null;
    allow_comments?: boolean;
    created_at?: string;
    updated_at?: string;
    faq?: Array<{ question: string; answer: string }> | null;
    author?: {
      id: number;
      name: string;
      slug?: string | null;
      avatar_url?: string | null;
    } | null;
    image?: { url: string | null; alt: string | null; caption: string | null };
    seo?: any;
    tags?: Array<{ id: number; name: string; slug: string }> | null;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PopularBlog {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  image_url?: string | null;
  image?: { url: string | null };
  created_at?: string | null;
}

async function getBlogData(slug: string): Promise<BlogData | null> {
  try {
    const res = await fetch(`${API_URL}/api/blogs/${slug}?limit=100`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, {
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

async function getPopularBlogs(currentSlug: string): Promise<PopularBlog[]> {
  try {
    const res = await fetch(`${API_URL}/api/blogs`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const allBlogs = json.data ?? [];
    return allBlogs
      .filter((b: any) => b.slug !== currentSlug)
      .slice(0, 4);
  } catch {
    return [];
  }
}

async function getAllBlogs(): Promise<any[]> {
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

async function getSettings(): Promise<any> {
  try {
    const res = await fetch(`${API_URL}/api/settings`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "June 30, 2026";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function resolveImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const normalizedBase = baseUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${normalizedBase}${cleanUrl}`;
}

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    const res = await fetch(`${API_URL}/api/blogs`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const blogs = json.data ?? [];
    return blogs.map((blog: any) => ({
      slug: blog.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getBlogData(resolvedParams.slug);
  if (!data) return {};

  const { blog } = data;
  const meta = blog.seo?.meta;
  const og = blog.seo?.og;

  const imageUrl = og?.["og:image"] || (blog.image?.url ? resolveImageUrl(blog.image.url) : "/logo.png");
  const authorName = blog.author?.name || "Web Creation Nepal";

  return {
    title: meta?.title || blog.name,
    description: meta?.description || blog.excerpt || "Web Creation Nepal Blog Channel",
    keywords: meta?.keywords || "",
    alternates: { canonical: `/blogs/${blog.slug}` },
    openGraph: {
      title: og?.["og:title"] || blog.name,
      description: og?.["og:description"] || blog.excerpt || "",
      url: `/blogs/${blog.slug}`,
      type: "article",
      publishedTime: blog.created_at || undefined,
      authors: [authorName],
      images: [
        {
          url: imageUrl,
          alt: blog.image?.alt || blog.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: og?.["og:title"] || blog.name,
      description: og?.["og:description"] || blog.excerpt || "",
      images: [imageUrl],
      creator: "@webcreationnepal",
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [data, categories, popularBlogs, settings, allBlogsList] = await Promise.all([
    getBlogData(resolvedParams.slug),
    getCategories(),
    getPopularBlogs(resolvedParams.slug),
    getSettings(),
    getAllBlogs(),
  ]);

  if (!data) {
    notFound();
  }

  const { blog } = data;

  const currentIndex = allBlogsList.findIndex((b: any) => b.slug === blog.slug);
  const prevBlog = currentIndex > 0 ? allBlogsList[currentIndex - 1] : null;
  const nextBlog = currentIndex < allBlogsList.length - 1 ? allBlogsList[currentIndex + 1] : null;

  // Process description as repeater sections
  let sections: BlogSection[] = [];
  if (blog.description) {
    if (Array.isArray(blog.description)) {
      sections = blog.description;
    } else if (typeof blog.description === "string") {
      try {
        const parsed = JSON.parse(blog.description);
        if (Array.isArray(parsed)) {
          sections = parsed;
        } else {
          sections = [{ title: "Overview", content: blog.description }];
        }
      } catch {
        sections = [{ title: "Overview", content: blog.description }];
      }
    }
  }

  // Dynamic Schema Generation
  const headersList = await headers();
  const host = headersList.get("host") || "demo.webcreationcanada.com";
  const protocol = host.includes("localhost") ? "http" : "https";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/blog";
  const baseUrl = `${protocol}://${host}${basePath}`;
  const pageUrl = `${baseUrl}/blogs/${blog.slug}`;
  const logoUrl = settings?.logo_url || `${baseUrl}/logo.png`;

  // Get social sameAs profiles
  const sameAs: string[] = [];
  if (settings?.social_links) {
    const sl = settings.social_links;
    if (sl.facebook) sameAs.push(sl.facebook);
    if (sl.x) sameAs.push(sl.x);
    if (sl.instagram) sameAs.push(sl.instagram);
    if (sl.threads) sameAs.push(sl.threads);
  }

  const schemas: any[] = [
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
      "publisher": { "@id": `${baseUrl}/#organization` }
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}/#breadcrumb`,
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
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": blog.name,
          "item": pageUrl
        }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": `${pageUrl}/#article`,
      "headline": blog.name,
      "description": blog.excerpt || blog.name,
      "inLanguage": "en-US",
      "mainEntityOfPage": pageUrl,
      "datePublished": blog.created_at || new Date().toISOString(),
      "dateModified": blog.updated_at || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": blog.author?.name || "Web Creation Nepal"
      },
      "publisher": { "@id": `${baseUrl}/#organization` },
      "image": blog.image?.url || logoUrl
    }
  ];

  if (blog.faq && blog.faq.length > 0) {
    schemas.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}/#faq`,
      "mainEntity": blog.faq.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }

  if (popularBlogs.length > 0) {
    schemas.push({
      "@type": "ItemList",
      "@id": `${pageUrl}/#related-items`,
      "name": "Related Blogs",
      "numberOfItems": popularBlogs.length,
      "itemListElement": popularBlogs.map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `${baseUrl}/blogs/${b.slug}`
      }))
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": schemas
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-20 font-sans text-zinc-800">
      {/* Dynamic JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav className="py-4 border-b border-zinc-200/60" aria-label="Breadcrumb">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link href="/" className="hover:text-[#2665A3] transition-colors">
            Home
          </Link>
          <span className="text-zinc-350">/</span>
          <span className="text-zinc-450">Blogs</span>
          <span className="text-zinc-350">/</span>
          <span className="text-zinc-650 truncate max-w-[200px] sm:max-w-none">
            {blog.name}
          </span>
        </div>
      </nav>

      {/* ── Main Layout Content Container ────────────────────────── */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ── Left Column: Article Body (70%) ───────────────────── */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#252525] lg:leading-[45px] leading-tight tracking-tight mb-6 max-w-full">
              {blog.name}
            </h1>

            {/* Meta Row: Author, Read Time, and Share */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/80">
              <div className="flex items-center gap-5">
                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-[#e1ecd9] flex items-center justify-center shrink-0">
                    <PenTool className="h-3 w-3 text-[#5d8246]" />
                  </div>
                  {blog.author?.slug ? (
                    <Link
                      href={`/authors/${blog.author.slug}`}
                      className="text-[14px] font-medium text-[#5D5D5D] hover:text-blue-650 transition-colors leading-[24px] cursor-pointer"
                    >
                      {blog.author.name}
                    </Link>
                  ) : (
                    <span className="text-[14px] font-medium text-[#5D5D5D] leading-[24px]">
                      {blog.author?.name || "Web Creation Nepal"}
                    </span>
                  )}
                </div>

                {/* Est Read Time */}
                {blog.read_time && (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[#e3ecda] flex items-center justify-center shrink-0">
                      <Clock className="h-3.5 w-3.5 text-[#5e8347]" />
                    </div>
                    <span className="text-[14px] font-medium text-[#5D5D5D] leading-[24px]">
                      {blog.read_time} min read
                    </span>
                  </div>
                )}
              </div>

              {/* Share Component */}
              <ShareButtons
                title={blog.name}
                description={blog.excerpt || undefined}
                url={`${process.env.NEXT_PUBLIC_APP_URL || "https://webcreation.com.np"}/blogs/${blog.slug}`}
                authorName={blog.author?.name || undefined}
                readTime={blog.read_time || undefined}
                imageUrl={blog.image?.url ? resolveImageUrl(blog.image.url) : undefined}
              />
            </div>

            {/* Featured Image */}
            {blog.image?.url && (
              <div className="relative aspect-[16/9] w-full max-w-full rounded-xl overflow-hidden mb-8 bg-zinc-100 border border-zinc-200/60 shadow-sm">
                <Image
                  src={resolveImageUrl(blog.image.url)}
                  alt={blog.image.alt || blog.name}
                  fill
                  priority
                  loading="eager"
                  {...({ fetchPriority: "high" } as any)}
                  className="object-cover"
                />
              </div>
            )}

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-zinc-800 text-[17px] font-semibold leading-relaxed mb-8 border-l-4 border-[#2665A3] pl-4 italic">
                {blog.excerpt}
              </p>
            )}

            {/* Repeater Sections Rendering */}
            <div className="space-y-12">
              {sections.map((sec, idx) => {
                const secId = slugify(sec.title);
                return (
                  <article key={idx} id={secId} className="scroll-mt-24">
                    <h2 className="text-xl sm:text-[24px] font-semibold text-[#252525] leading-[30px] tracking-tight mb-4 border-b border-zinc-100 pb-2">
                      {sec.title}
                    </h2>
                    <div 
                      dangerouslySetInnerHTML={{ __html: formatTableContent(sec.content) }} 
                      className="blog-content-body text-zinc-750 leading-relaxed text-[15px] sm:text-[16px]"
                    />
                  </article>
                );
              })}
            </div>

            {/* Tags list */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-zinc-150">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="text-xs font-bold text-zinc-650 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 px-3 py-1 rounded-full transition-colors cursor-pointer border border-zinc-200/60"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Related Channels in place of Next/Prev Navigation */}
            {popularBlogs.length > 0 && (
              <div className="mt-12 pt-8 border-y border-zinc-200/80 pb-8">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">
                  Related Channels
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {popularBlogs.slice(0, 2).map((pop) => (
                    <Link
                      key={pop.id}
                      href={`/blogs/${pop.slug}`}
                      className="group flex gap-4 p-4 rounded-xl border border-zinc-200/80 hover:border-brand-orange bg-[#f4f7fc]/25 hover:bg-[#f4f7fc]/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                    >
                      {pop.image_url && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-150 border border-zinc-200/40">
                          <Image
                            src={resolveImageUrl(pop.image_url)}
                            alt={pop.name}
                            fill
                            className="object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-sm text-zinc-800 group-hover:text-blue-650 leading-snug line-clamp-2 transition-colors">
                          {pop.name}
                        </h4>
                        {pop.excerpt && (
                          <p className="text-[11px] text-zinc-500 line-clamp-2 mt-1 leading-normal">
                            {pop.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            {blog.faq && blog.faq.length > 0 && (
              <div className="mt-12 pt-8 border-t border-zinc-200/80">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">
                  Frequently Asked Questions (FAQ)
                </h3>
                <div className="space-y-4">
                  {blog.faq.map((item, idx) => (
                    <details
                      key={idx}
                      className="group border border-zinc-250/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300"
                    >
                      <summary className="flex items-center justify-between gap-4 p-4 font-bold text-[15px] text-zinc-900 bg-[#f4f7fc]/50 cursor-pointer list-none hover:bg-[#f4f7fc] transition-colors">
                        <span>{item.question}</span>
                        <span className="transition-transform duration-200 group-open:rotate-180 shrink-0">
                          <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </summary>
                      <div className="p-4 border-t border-zinc-200/60 text-sm text-zinc-700 leading-relaxed bg-white">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Related/Recent Blogs grid row below the article */}
            {/* Next and Previous Sibling Articles Navigation */}
            {(prevBlog || nextBlog) && (
              <div className="mt-12 pt-10 border-t border-zinc-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Previous Article Card */}
                  {prevBlog ? (
                    <Link
                      href={`/blogs/${prevBlog.slug}`}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-200/60 bg-[#f4f7fc]/25 hover:bg-[#f4f7fc]/50 hover:border-brand-orange hover:shadow-sm transition-all duration-300 cursor-pointer text-left"
                    >
                      {prevBlog.image_url && (
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-100 border border-zinc-150 shadow-sm">
                          <Image
                            src={resolveImageUrl(prevBlog.image_url)}
                            alt={prevBlog.name}
                            fill
                            className="object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                          &larr; Previous Article
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-800 group-hover:text-blue-650 transition-colors line-clamp-2 leading-snug">
                          {prevBlog.name}
                        </h4>
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}

                  {/* Next Article Card */}
                  {nextBlog ? (
                    <Link
                      href={`/blogs/${nextBlog.slug}`}
                      className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-200/60 bg-[#f4f7fc]/25 hover:bg-[#f4f7fc]/50 hover:border-brand-orange hover:shadow-sm transition-all duration-300 cursor-pointer text-right"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                          Next Article &rarr;
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-zinc-800 group-hover:text-blue-650 transition-colors line-clamp-2 leading-snug">
                          {nextBlog.name}
                        </h4>
                      </div>
                      {nextBlog.image_url && (
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-zinc-100 border border-zinc-150 shadow-sm">
                          <Image
                            src={resolveImageUrl(nextBlog.image_url)}
                            alt={nextBlog.name}
                            fill
                            className="object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>
              </div>
            )}

            {/* Comments Section */}
            {blog.id && blog.allow_comments !== false && (
              <CommentSection blogId={blog.id} blogSlug={blog.slug} />
            )}
          </div>

          {/* ── Right Column: Sidebar (30%) ──────────────────────── */}
          <aside className="lg:col-span-4" aria-label="Sidebar">
            
            <div className="sticky top-[107px] z-10 space-y-8">
              {/* Table of Content Widget */}
              <TableOfContents sections={sections} />

              {/* Categories Widget */}
              <CategoryList categories={categories} />

              {/* Branded Web Creation Nepal CTA Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a5276] via-[#1f618d] to-[#2e86c1] text-white p-6 shadow-md border border-blue-900/10 text-center flex flex-col items-center justify-center min-h-[140px] group">
                <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[size:16px_16px]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">
                  Web Creation Nepal
                </p>
                <h4 className="text-base font-extrabold mb-3 leading-tight max-w-[240px]">
                  Professional SEO & Web Development Services
                </h4>
                <Link
                  href="https://webcreation.com.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-zinc-55 text-blue-900 hover:text-blue-950 text-xs font-extrabold uppercase rounded-lg shadow transition-all duration-300 transform group-hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            </div>

          </aside>

        </div>
      </main>

      {/* Inline styles for custom elements inside dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content-body {
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .blog-content-body h1, .blog-content-body h2, .blog-content-body h3, .blog-content-body h4 {
          font-weight: 700;
          color: #18181b;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }
        .blog-content-body h1 {
          font-size: 1.5rem;
        }
        .blog-content-body h2 {
          font-size: 1.35rem;
        }
        .blog-content-body h3 {
          font-size: 1.2rem;
        }
        .blog-content-body h4 {
          font-size: 1.1rem;
        }
        .blog-content-body p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
          color: #27272a;
        }
        .blog-content-body ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.5rem;
        }
        .blog-content-body ul li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.65rem;
          color: #27272a;
        }
        .blog-content-body ul li::before {
          content: "";
          position: absolute;
          left: 0.25rem;
          top: 0.6rem;
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 50%;
          background-color: #5e8347;
        }
        .blog-content-body a {
          color: #2563eb !important;
          text-decoration: underline !important;
          font-weight: 600;
          transition: color 0.15s ease-in-out;
        }
        .blog-content-body a:hover {
          color: #1d4ed8 !important;
        }
        .blog-content-body strong {
          color: #18181b;
          font-weight: 700;
        }
        
        /* Premium Table Styles matching first image with responsiveness */
        .blog-content-body table {
          width: 100% !important;
          table-layout: auto !important;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2rem 0;
          font-size: 0.875rem;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .blog-content-body table thead tr {
          background-color: #2665A3;
          color: #ffffff;
        }
        .blog-content-body table th {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          text-align: center;
          white-space: nowrap !important;
          background-color: #2665A3;
          color: #ffffff;
        }
        .blog-content-body table th:last-child {
          border-right: none;
        }
        .blog-content-body table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          text-align: center;
          vertical-align: middle;
          white-space: nowrap !important;
        }
        .blog-content-body table td:last-child {
          border-right: none;
        }
        .blog-content-body table tr:last-child td {
          border-bottom: none;
        }
        /* Zebra striping */
        .blog-content-body table tbody tr:nth-child(even) td {
          background-color: #f9fafb;
        }
        /* First column cells as side headers */
        .blog-content-body table tbody tr td:first-child,
        .blog-content-body table tbody tr th:first-child {
          background-color: #f3f4f6;
          font-weight: 700;
          color: #1f2937;
          border-right: 1px solid #e5e7eb;
          text-align: center;
        }
        /* Highlighted Column Styles matching the budget column */
        .blog-content-body table th.highlight-column,
        .blog-content-body table tr:first-child th.highlight-column {
          background-color: #709d1e !important;
          color: #ffffff !important;
        }
        .blog-content-body table td.highlight-column {
          border-left: 2px solid #709d1e !important;
          border-right: 2px solid #709d1e !important;
        }
        .blog-content-body table tr:last-child td.highlight-column {
          border-bottom: 2px solid #709d1e !important;
        }
        .blog-content-body table td a {
          display: inline-block;
          padding: 6px 16px;
          background-color: #9ca3af;
          color: #ffffff !important;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-decoration: none !important;
          border-bottom: none;
          transition: background-color 0.2s;
        }
        .blog-content-body table td a:hover {
          background-color: #4b5563;
          color: #ffffff !important;
        }

        /* ── BLOCKQUOTE ── */
        .blog-content-body blockquote {
          display: block !important;
          position: relative !important;
          border-top: 1.5px dashed #d1d5db !important;
          border-bottom: 1.5px dashed #d1d5db !important;
          border-left: none !important;
          border-right: none !important;
          padding: 28px 24px 28px 72px !important;
          margin: 2.5rem 0 !important;
          font-size: 1.05rem !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          line-height: 1.7 !important;
          font-style: normal !important;
          background: transparent !important;
        }
        .blog-content-body blockquote::before {
          content: "“" !important;
          position: absolute !important;
          left: 10px !important;
          top: 0px !important;
          font-size: 100px !important;
          font-family: Georgia, serif !important;
          color: #d1d5db !important;
          line-height: 1 !important;
          font-weight: 400 !important;
          font-style: normal !important;
        }
        .blog-content-body blockquote p {
          margin: 0 !important;
          display: block !important;
          font-size: 1.05rem !important;
          font-weight: 700 !important;
          color: #1f2937 !important;
          line-height: 1.7 !important;
        }
      ` }} />
    </div>
  );
}
