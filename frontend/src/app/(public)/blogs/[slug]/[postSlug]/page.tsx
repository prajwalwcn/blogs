import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, PenTool, ArrowRightCircle, FileText, ChevronRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import ShareButtons from "@/components/public/ShareButtons";
import CommentSection from "@/components/public/CommentSection";
import PostCard from "@/components/public/PostCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────
interface PostDetail {
  id: number;
  blog_id: number;
  author_id: number;
  title: string;
  slug: string;
  short_description?: string | null;
  content: string;
  read_time?: number | null;
  image_url?: string | null;
  image_alt?: string | null;
  image_caption?: string | null;
  published_at?: string | null;
  faq?: { question: string; answer: string }[];
  author?: {
    id: number;
    name: string;
    avatar_url?: string | null;
  } | null;
  categories?: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  seo?: any;
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

// ── Data Fetching ──────────────────────────────────────────────────────────
async function getPostData(postSlug: string): Promise<{ data: PostDetail; related: any[] } | null> {
  try {
    const res = await fetch(`${API_URL}/api/posts/${postSlug}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getBlogData(blogSlug: string) {
  try {
    const res = await fetch(`${API_URL}/api/blogs/${blogSlug}?limit=100`, {
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

// ── SEO Metadata ───────────────────────────────────────────────────────────
interface PageProps {
  params: Promise<{ slug: string; postSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const postData = await getPostData(resolvedParams.postSlug);
  if (!postData) return {};

  const post = postData.data;
  const meta = post.seo?.meta;
  const og = post.seo?.og;

  return {
    title: meta?.title || post.title,
    description: meta?.description || post.short_description || "",
    keywords: meta?.keywords || "",
    alternates: { canonical: `/blogs/${resolvedParams.slug}/${post.slug}` },
    openGraph: {
      title: og?.["og:title"] || post.title,
      description: og?.["og:description"] || post.short_description || "",
      url: `/blogs/${resolvedParams.slug}/${post.slug}`,
      images: og?.["og:image"] ? [{ url: og["og:image"] }] : [],
    },
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "June 30, 2026";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function parseTOC(htmlContent: string) {
  const headings: Array<{ id: string; text: string; level: number }> = [];
  const regex = /<h(2|3)([^>]*)>([\s\S]*?)<\/h\1>/gi;
  let index = 0;
  
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/<\/?[^>]+(>|$)/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const updatedHtml = htmlContent.replace(regex, (match, level, attrs, contentText) => {
    const cleanText = contentText.replace(/<\/?[^>]+(>|$)/g, "").trim();
    const id = slugify(cleanText) || `heading-${index++}`;
    headings.push({ id, text: cleanText, level: parseInt(level) });
    
    if (/id=/i.test(attrs)) {
      return `<h${level}${attrs}>${contentText}</h${level}>`;
    }
    return `<h${level} id="${id}"${attrs}>${contentText}</h${level}>`;
  });

  return { headings, html: updatedHtml };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [postData, blogData, categories, popularPostsRaw] = await Promise.all([
    getPostData(resolvedParams.postSlug),
    getBlogData(resolvedParams.slug),
    getCategories(),
    getPopularPosts(),
  ]);

  if (!postData) {
    notFound();
  }

  const post = postData.data;
  const blog = blogData?.blog || { name: "Blogs", slug: resolvedParams.slug };
  const formattedDate = formatDate(post.published_at);

  // Parse HTML content to inject H2/H3 IDs and generate Table of Content data
  const { headings, html: processedContent } = parseTOC(post.content || "");

  // Fallback stock image logic for broken local seeder links
  const getValidImageUrl = (url?: string | null) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    const isRealImage =
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png") ||
      lower.endsWith(".webp") ||
      lower.endsWith(".gif") ||
      lower.endsWith(".svg") ||
      lower.includes("unsplash.com") ||
      lower.includes("/storage/uploads/") ||
      lower.includes("/uploads/");

    if (!isRealImage) {
      return "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&h=450&q=80";
    }
    return url;
  };

  const finalImageUrl = getValidImageUrl(post.image_url);

  // Map popular posts and format them
  const displayPopularPosts = popularPostsRaw.map((p) => {
    // If the backend didn't supply blog_slug, fallback to current or empty
    const parentSlug = p.blog_slug || resolvedParams.slug;
    return {
      ...p,
      parentSlug,
      imageUrl: getValidImageUrl(p.image_url),
    };
  });

  return (
    <div className="bg-[#fcfdfe] min-h-screen pb-20 font-sans text-zinc-800">
      {/* Schema Injection */}
      {post.seo?.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(post.seo.schema) }}
        />
      )}

      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav className="py-4 border-b border-zinc-200/60" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-zinc-350">/</span>
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Blogs
          </Link>
          <span className="text-zinc-350">/</span>
          <Link href={`/blogs/${blog.slug}`} className="hover:text-blue-600 transition-colors truncate max-w-[200px] sm:max-w-none">
            {blog.name}
          </Link>
        </div>
      </nav>

      {/* ── Main Layout Content Container ────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* ── Left Column: Article Body (70%) ───────────────────── */}
          <article className="lg:col-span-8 flex flex-col">
            
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-extrabold text-zinc-900 leading-[1.2] tracking-tight mb-6 max-w-[770px]">
              {post.title}
            </h1>

            {/* Meta Row: Author, Date, and Share */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-8 border-b border-zinc-200/80">
              <div className="flex items-center gap-5">
                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-[#e1ecd9] flex items-center justify-center shrink-0">
                    <PenTool className="h-3 w-3 text-[#5d8246]" />
                  </div>
                  <span className="text-[13px] font-semibold text-zinc-650">
                    {post.author?.name || "Web Creation Nepal"}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-[#e3ecda] flex items-center justify-center shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-[#5e8347]" />
                  </div>
                  <span className="text-[13px] font-medium text-zinc-550">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Share Component */}
              <ShareButtons title={post.title} />
            </div>

            {/* Featured Image */}
            {finalImageUrl && (
              <div className="relative aspect-[770/549] w-full max-w-[770px] rounded-[4px] overflow-hidden mb-8 bg-zinc-100 border border-zinc-200/60 shadow-sm">
                <Image
                  src={finalImageUrl}
                  alt={post.image_alt || post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Rich Text Body Content */}
            <div 
              dangerouslySetInnerHTML={{ __html: processedContent }} 
              className="blog-content-body"
              style={{ contentVisibility: "auto" }}
            />

            {/* FAQ Section */}
            {((post.faq && post.faq.length > 0) || (blog.faq && blog.faq.length > 0)) && (
              <div className="mt-12 pt-8 border-t border-zinc-200/80">
                <h3 className="text-lg font-bold text-zinc-900 mb-6">
                  Frequently Asked Questions (FAQ)
                </h3>
                <div className="space-y-4">
                  {(post.faq && post.faq.length > 0 ? post.faq : blog.faq).map((item: any, idx: number) => (
                    <details
                      key={idx}
                      className="group border border-zinc-250/80 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden transition-all duration-300"
                    >
                      <summary className="flex items-center justify-between gap-4 p-4 font-bold text-[15px] text-zinc-900 bg-[#f4f7fc]/50 cursor-pointer list-none hover:bg-[#f4f7fc] transition-colors">
                        <span>{item.question}</span>
                        <span className="transition-transform duration-200 group-open:rotate-180 shrink-0">
                          <ChevronDown className="h-4.5 w-4.5 text-zinc-550" />
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

            {/* Tags Bottom Row */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-zinc-250/70">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">
                  # Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href="/"
                      className="px-3 py-1 bg-[#f4f7fc] hover:bg-[#eef2f6] border border-zinc-200/50 hover:border-zinc-300 rounded-full text-[11px] font-semibold text-zinc-600 transition-all shadow-sm"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section (Associated with the parent blog) */}
            {blog.id && blog.allow_comments !== false && (
              <CommentSection blogId={blog.id} blogSlug={blog.slug} />
            )}
          </article>

          {/* ── Right Column: Sidebar (30%) ──────────────────────── */}
          <aside className="lg:col-span-4 space-y-8" aria-label="Sidebar">
            
            {/* Table of Content Widget (Sticky and layered on top of other content) */}
            {headings.length > 0 && (
              <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm sticky top-[107px] z-10">
                <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70">
                  Table of Content
                </h3>
                <ul className="space-y-4">
                  {headings.map((heading, idx) => (
                    <li key={idx} className={`flex items-start gap-3 ${heading.level === 3 ? "pl-4" : ""}`}>
                      <span className="text-[10px] font-bold w-5 h-5 rounded-full bg-[#e3ecda] text-[#5e8347] flex items-center justify-center shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <a
                        href={`#${heading.id}`}
                        className="text-[14px] leading-snug hover:text-[#2665A3] transition-colors font-semibold text-zinc-750"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 1. Categories Widget */}
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

            {/* 2. Popular Post Widget */}
            <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
              <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70">
                Popular Post
              </h3>
              <div className="divide-y divide-zinc-200/60 -my-3">
                {displayPopularPosts.slice(0, 4).map((popPost) => {
                  const isActive = popPost.slug === post.slug;
                  return (
                    <div 
                      key={popPost.id}
                      className={`py-4 flex gap-4 items-start first:pt-0 last:pb-0 ${
                        isActive ? "opacity-90" : ""
                      }`}
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
                          className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors ${
                            isActive ? "text-[#2665A3] underline decoration-1" : "text-zinc-800 hover:text-blue-700"
                          }`}
                        >
                          {popPost.title}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Branded Web Creation Nepal CTA Banner */}
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

        {/* ── Related Posts Section ───────────────────────────── */}
        {postData.related && postData.related.length > 0 && (
          <section className="mt-16 pt-10 border-t border-zinc-200/80" aria-labelledby="related-heading">
            <h3 id="related-heading" className="text-xl font-bold text-zinc-900 mb-8">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {postData.related.slice(0, 3).map((relatedPost: any) => {
                const mappedPost = {
                  id: relatedPost.id,
                  title: relatedPost.title,
                  slug: relatedPost.slug,
                  short_description: relatedPost.short_description,
                  image_url: getValidImageUrl(relatedPost.image_url),
                  image_alt: relatedPost.image_alt,
                  published_at: relatedPost.published_at,
                  read_time: relatedPost.read_time,
                  is_featured: relatedPost.is_featured,
                  author: relatedPost.author,
                  categories: relatedPost.categories,
                };
                return (
                  <PostCard
                    key={relatedPost.id}
                    post={mappedPost}
                    blogSlug={blog.slug}
                    size="small"
                  />
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Inline styles for custom bullet dots & list rendering */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content-body {
          font-size: 15px;
          line-height: 1.7;
          color: #4b5563;
          max-width: none;
        }
        @media (min-width: 640px) { .blog-content-body { font-size: 16px; } }
        .blog-content-body a { color: #2665A3; text-decoration: underline; }
        .blog-content-body a:hover { color: #1a4a7a; }
        .blog-content-body ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content-body ol li { margin-bottom: 0.5rem; color: #4b5563; }
        .blog-content-body img { max-width: 100%; height: auto; border-radius: 4px; }
        .blog-content-body h1 { font-size: 1.5rem; font-weight: 700; color: #18181b; margin-top: 2rem; margin-bottom: 0.75rem; }
        .blog-content-body h4, .blog-content-body h5, .blog-content-body h6 { font-weight: 700; color: #18181b; margin-top: 1.5rem; margin-bottom: 0.5rem; }
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
        /* Custom green dot markup */
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
        .blog-content-body strong {
          color: #18181b;
          font-weight: 700;
        }

        /* ── CARD TABLE (border: none) — column-separated layout ── */
        .blog-content-body table[style*="border: none"] {
          width: 100% !important;
          border-collapse: separate !important;
          border-spacing: 12px 0 !important;
          margin: 2rem 0 !important;
          background: transparent !important;
        }
        .blog-content-body table[style*="border: none"] th {
          color: #ffffff !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          padding: 14px 16px !important;
          text-align: center !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .blog-content-body table[style*="border: none"] td {
          padding: 12px 16px !important;
          text-align: center !important;
          vertical-align: middle !important;
          border: none !important;
          border-radius: 0 !important;
        }
        .blog-content-body table[style*="border: none"] tbody tr:nth-child(odd) td {
          background-color: #f3f4f6 !important;
        }
        .blog-content-body table[style*="border: none"] tbody tr:nth-child(even) td {
          background-color: #ffffff !important;
        }
        .blog-content-body table[style*="border: none"] td:first-child {
          font-weight: 700 !important;
          color: #1f2937 !important;
        }

        /* ── STANDARD TABLE ── */
        .blog-content-body table:not([style*="border: none"]) {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2rem 0;
          font-size: 0.875rem;
          color: #374151;
          border: 1px solid #e5e7eb;
          overflow: hidden;
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
        .blog-content-body table:not([style*="border: none"]) td:last-child { border-right: none; }
        .blog-content-body table:not([style*="border: none"]) tr:last-child td { border-bottom: none; }
        .blog-content-body table:not([style*="border: none"]) tbody tr:nth-child(even) td { background-color: #f9fafb; }
        .blog-content-body table:not([style*="border: none"]) tbody tr td:first-child {
          background-color: #f3f4f6;
          font-weight: 700;
          color: #1f2937;
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
