import * as React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PenTool, Globe, ArrowRight } from "lucide-react";
import BlogCard from "@/components/public/BlogCard";
import { Metadata } from "next";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

interface BlogItem {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  description?: any;
  read_time?: number | null;
  author_id?: number | null;
  author?: {
    id: number;
    name: string;
    slug?: string | null;
    avatar_url?: string | null;
  } | null;
  image?: { url: string | null; alt: string | null; caption: string | null } | null;
  categories?: Array<{ id: number; name: string; slug: string }> | null;
  tags?: Array<{ id: number; name: string; slug: string }> | null;
  created_at?: string | null;
}

interface Author {
  id: number;
  name: string;
  slug: string;
  bio?: string | null;
  image_url?: string | null;
  twitter_handle?: string | null;
  linkedin_url?: string | null;
}

interface AuthorData {
  author: Author;
  blogs: BlogItem[];
}

async function getAuthorData(slug: string): Promise<AuthorData | null> {
  try {
    const res = await fetch(`${API_URL}/api/authors/${slug}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to load author data:", err);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getAuthorData(resolvedParams.slug);
  if (!data) return {};

  const { author } = data;
  return {
    title: `${author.name} — Web Creation Nepal Author`,
    description: author.bio || `View all articles authored by ${author.name} on Web Creation Nepal.`,
  };
}

export default async function AuthorDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getAuthorData(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { author, blogs } = data;

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${API_URL}${cleanUrl}`;
  };

  return (
    <div className="w-full py-10 sm:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Column - Author Info - Wider */}
          <div className="lg:w-2/5 xl:w-[340px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm sticky top-8">
              {/* Avatar */}
              <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden bg-zinc-150 border-4 border-white shadow-md mx-auto">
                {author.image_url ? (
                  <Image
                    src={resolveImageUrl(author.image_url)}
                    alt={author.name}
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-blue-50 text-blue-600">
                    <PenTool className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="text-center mt-5">
                <h1 className="text-xl sm:text-2xl font-black text-[#252525] mb-2">
                  {author.name}
                </h1>
                
                {/* Author Badge */}
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <PenTool className="h-3.5 w-3.5" />
                  Author
                </div>
                
                <p className="text-zinc-650 text-sm leading-[24px] mb-5">
                  {author.bio || "Web Creation Nepal author sharing insights and expert tutorials on technology, SEO, and business development."}
                </p>
                
                {/* Stats */}
                <div className="flex justify-center gap-6 py-3 border-t border-zinc-100 mb-4">
                  <div>
                    <p className="text-2xl font-bold text-[#252525]">{blogs.length}</p>
                    <p className="text-xs text-zinc-500 font-medium">Articles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Blog List - Smaller cards */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-black text-[#252525]">
                Articles by {author.name}
              </h2>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-16 bg-white border border-zinc-200/80 rounded-2xl">
                <p className="text-zinc-500 text-sm font-medium">
                  This author has not published any articles yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    id={blog.id}
                    name={blog.name}
                    slug={blog.slug}
                    excerpt={blog.excerpt}
                    description={blog.description}
                    read_time={blog.read_time}
                    author={blog.author}
                    image={blog.image ? { url: blog.image.url, alt: blog.image.alt } : undefined}
                    created_at={blog.created_at}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}