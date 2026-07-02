import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Globe, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  ArrowRightCircle, 
  Calendar,
  PenTool
} from "lucide-react";
import Image from "next/image";
import CommentSection from "@/components/public/CommentSection";
import ShareButtons from "@/components/public/ShareButtons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface BlogData {
  blog: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    read_time?: number | null;
    allow_comments?: boolean;
    faq?: Array<{ question: string; answer: string }> | null;
    author?: {
      id: number;
      name: string;
      avatar_url?: string | null;
    } | null;
    image?: { url: string | null; alt: string | null; caption: string | null };
    seo?: any;
  };
  posts: {
    data: any[];
    meta?: any;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PopularPost {
  id: number;
  title: string;
  slug: string;
  image_url?: string | null;
  published_at?: string | null;
  blog_slug?: string;
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

async function getPopularPosts(): Promise<PopularPost[]> {
  try {
    const res = await fetch(`${API_URL}/api/posts?limit=4`, {
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

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "June 30, 2026";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getBlogData(resolvedParams.slug);
  if (!data) return {};

  const { blog } = data;
  const meta = blog.seo?.meta;
  const og = blog.seo?.og;

  return {
    title: meta?.title || blog.name,
    description: meta?.description || blog.description,
    keywords: meta?.keywords || "",
    alternates: { canonical: `/blogs/${blog.slug}` },
    openGraph: {
      title: og?.["og:title"] || blog.name,
      description: og?.["og:description"] || blog.description || "",
      url: `/blogs/${blog.slug}`,
      images: og?.["og:image"] ? [{ url: og["og:image"] }] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [data, categories, popularPostsRaw] = await Promise.all([
    getBlogData(resolvedParams.slug),
    getCategories(),
    getPopularPosts(),
  ]);

  if (!data) {
    notFound();
  }

  const { blog, posts } = data;

  // Pre-process popular posts (match their parent blog slug if not returned directly by backend)
  const displayPopularPosts = popularPostsRaw.map((popPost) => {
    const parentSlug = popPost.blog_slug || "developers-diary";
    return {
      id: popPost.id,
      title: popPost.title,
      slug: popPost.slug,
      imageUrl: popPost.image_url,
      published_at: popPost.published_at,
      parentSlug,
    };
  });

  // Use FAQs from the blog itself
  const allFaqs: Array<{ question: string; answer: string }> = blog.faq ?? [];

  const firstPost = posts.data[0];

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-20 font-sans text-zinc-800">
      {/* JSON-LD Schema */}
      {blog.seo?.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blog.seo.schema) }}
        />
      )}

      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav className="py-4 border-b border-zinc-200/60" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ── Left Column: Article Body (70%) ───────────────────── */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-zinc-900 leading-[1.2] tracking-tight mb-6 max-w-[770px]">
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
                  <span className="text-[13px] font-semibold text-zinc-650">
                    {blog.author?.name || "Web Creation Nepal"}
                  </span>
                </div>

                {/* Est Read Time */}
                {blog.read_time && (
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-[#e3ecda] flex items-center justify-center shrink-0">
                      <Clock className="h-3.5 w-3.5 text-[#5e8347]" />
                    </div>
                    <span className="text-[13px] font-medium text-zinc-555">
                      {blog.read_time} min read
                    </span>
                  </div>
                )}
              </div>

              {/* Share Component */}
              <ShareButtons title={blog.name} />
            </div>

            {/* Featured Image */}
            {blog.image?.url && (
              <div className="relative aspect-[770/549] w-full max-w-[770px] rounded-[4px] overflow-hidden mb-8 bg-zinc-100 border border-zinc-200/60 shadow-sm">
                <Image
                  src={blog.image.url}
                  alt={blog.image.alt || blog.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            <div 
              dangerouslySetInnerHTML={{ 
                __html: blog.description || "Welcome to our blog channel. Here we share insights, technology advice, and cultural updates." 
              }}
              className="prose prose-zinc max-w-none text-zinc-750 leading-relaxed text-[15px] sm:text-[16px] mb-12"
            />

            {/* Sub Posts / Articles list rendered in full detail */}
            <div className="mb-12">

              {posts.data.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-300 rounded-2xl bg-white">
                  <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500 text-sm">No articles published under this channel yet.</p>
                </div>
              ) : (
                <div className="space-y-16">
                  {posts.data.map((post, idx) => (
                    <article 
                      key={post.id} 
                      id={post.slug} 
                      className="scroll-mt-24 border-t border-zinc-200/80 pt-10 first:border-t-0 first:pt-0"
                    >
                      {/* Sub-post Title */}
                      <h3 className="text-[24px] leading-[30px] font-semibold text-zinc-900 tracking-tight mb-6 capitalize max-w-[700px]">
                        {post.title}
                      </h3>

                      {/* Optional Sub-post Featured Image */}
                      {post.image_url && (
                        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden mb-6 bg-zinc-100 border border-zinc-200/50 shadow-sm">
                          <Image
                            src={post.image_url}
                            alt={post.image_alt || post.title}
                            fill
                            priority={idx === 0}
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Sub-post Content */}
                      <div 
                        dangerouslySetInnerHTML={{ __html: post.content || "" }} 
                        className="blog-content-body text-zinc-700 leading-relaxed text-[15px] sm:text-[16px]"
                      />
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ Section */}
            {allFaqs.length > 0 && (
              <div className="mt-6 pt-8 border-t border-zinc-200/80">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">
                  Frequently Asked Questions (FAQ)
                </h3>
                <div className="space-y-4">
                  {allFaqs.map((item, idx) => (
                    <details
                      key={idx}
                      className="group border border-zinc-250/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300"
                    >
                      <summary className="flex items-center justify-between gap-4 p-4 font-bold text-[15px] text-zinc-900 bg-[#f4f7fc]/50 cursor-pointer list-none hover:bg-[#f4f7fc] transition-colors">
                        <span>{item.question}</span>
                        <span className="transition-transform duration-200 group-open:rotate-180 shrink-0">
                          <ChevronDown className="h-4.5 w-4.5 text-zinc-555" />
                        </span>
                      </summary>
                      <div className="p-4 border-t border-zinc-200/60 text-sm text-zinc-650 leading-relaxed bg-white">
                        {item.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section (Associated with the blog) */}
            {blog.id && blog.allow_comments !== false && (
              <CommentSection blogId={blog.id} blogSlug={blog.slug} />
            )}
          </div>

          {/* ── Right Column: Sidebar (30%) ──────────────────────── */}
          <aside className="lg:col-span-4 space-y-8" aria-label="Sidebar">
            
            <div className="sticky top-[107px] z-10 space-y-8">
              {/* Table of Content Widget */}
              {posts.data.length > 0 && (
                <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70">
                    Table of Content
                  </h3>
                  <ul className="space-y-4">
                    {posts.data.map((bp: any, idx: number) => (
                      <li key={bp.id} className="flex items-start gap-3">
                        <span className="text-xs font-bold w-5 h-5 rounded-full bg-[#e3ecda] text-[#5e8347] flex items-center justify-center shrink-0 mt-0.5">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <a
                          href={`#${bp.slug}`}
                          className="text-[14px] leading-snug hover:text-[#2665A3] transition-colors font-semibold text-zinc-750"
                        >
                          {bp.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Categories Widget */}
              <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70">
                  Categories
                </h3>
                <ul className="space-y-4">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href="/"
                        className="flex items-center gap-3 group text-[14px] font-semibold text-zinc-700 hover:text-blue-650 transition-colors"
                      >
                        <ArrowRightCircle className="h-5 w-5 text-[#5e8347] shrink-0 group-hover:scale-105 transition-transform" />
                        <span>{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Popular Post Widget */}
            <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70">
                Popular Post
              </h3>
              <div className="divide-y divide-zinc-200/60 -my-3">
                {displayPopularPosts.slice(0, 4).map((popPost) => (
                  <div 
                    key={popPost.id}
                    className="py-4 flex gap-4 items-start first:pt-0 last:pb-0"
                  >
                    {popPost.imageUrl && (
                      <Link 
                        href={`/blogs/${popPost.parentSlug}/${popPost.slug}`}
                        className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-150 border border-zinc-200/40"
                      >
                        <Image
                          src={popPost.imageUrl}
                          alt={popPost.title}
                          fill
                          className="object-cover"
                        />
                      </Link>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5e8347] mb-1.5 uppercase tracking-wide">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(popPost.published_at)}</span>
                      </div>
                      <Link
                        href={`/blogs/${popPost.parentSlug}/${popPost.slug}`}
                        className="text-[13px] font-bold text-zinc-800 hover:text-blue-700 transition-colors line-clamp-2 leading-snug"
                      >
                        {popPost.title}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

          </aside>

        </div>
      </main>

      {/* Inline styles for custom elements inside dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content-body h2, .blog-content-body h3 {
          font-weight: 700;
          color: #18181b;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }
        .blog-content-body h2 {
          font-size: 1.25rem;
        }
        .blog-content-body h3 {
          font-size: 1.125rem;
        }
        .blog-content-body p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
          color: #4b5563;
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
          color: #4b5563;
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
          color: #1f618d;
          text-decoration: none;
          border-bottom: 1px solid #1f618d;
          font-weight: 650;
        }
        .blog-content-body a:hover {
          color: #2e86c1;
          border-bottom-color: #2e86c1;
        }
        .blog-content-body strong {
          color: #18181b;
          font-weight: 700;
        }
        
        /* Premium Table Styles matching first image */
        .blog-content-body table:not([style*="border: none"]) {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2rem 0;
          font-size: 0.875rem;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .blog-content-body table:not([style*="border: none"]) thead tr,
        .blog-content-body table:not([style*="border: none"]) tr:first-child {
          background-color: #2665A3;
          color: #ffffff;
        }
        .blog-content-body table:not([style*="border: none"]) th,
        .blog-content-body table:not([style*="border: none"]) tr:first-child td,
        .blog-content-body table:not([style*="border: none"]) tr:first-child th {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 14px 16px;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid rgba(255, 255, 255, 0.15);
          text-align: center;
          background-color: #2665A3;
          color: #ffffff;
        }
        .blog-content-body table:not([style*="border: none"]) th:last-child,
        .blog-content-body table:not([style*="border: none"]) tr:first-child td:last-child,
        .blog-content-body table:not([style*="border: none"]) tr:first-child th:last-child {
          border-right: none;
        }
        .blog-content-body table:not([style*="border: none"]) td {
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          text-align: center;
          vertical-align: middle;
          background-color: #ffffff;
        }
        .blog-content-body table:not([style*="border: none"]) td:last-child {
          border-right: none;
        }
        .blog-content-body table:not([style*="border: none"]) tr:last-child td {
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
        .blog-content-body table tr:first-child td.highlight-column,
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
          color: #ffffff;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-decoration: none;
          border-bottom: none;
          transition: background-color 0.2s;
        }
        .blog-content-body table td a:hover {
          background-color: #4b5563;
          color: #ffffff;
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
