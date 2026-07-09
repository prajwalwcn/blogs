import * as React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Tag as TagIcon, Hash, BookOpen, ArrowRight } from "lucide-react";
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

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface TagData {
  tag: Tag;
  blogs: BlogItem[];
}

async function getTagData(slug: string): Promise<TagData | null> {
  try {
    const res = await fetch(`${API_URL}/api/tags/${slug}`, {
      next: { revalidate: 0 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Failed to load tag data:", err);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getTagData(resolvedParams.slug);
  if (!data) return {};

  const { tag } = data;
  return {
    title: `Articles tagged with #${tag.name} — Web Creation Nepal`,
    description: `Browse all articles and guides tagged with #${tag.name} on Web Creation Nepal.`,
  };
}

export default async function TagDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const data = await getTagData(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { tag, blogs } = data;

  return (
    <div className="w-full py-8 sm:py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        
        {/* Simple Tag Header - No Box */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Tag</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#252525] mb-3">
            #{tag.name}
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Articles and insights tagged with <span className="font-semibold text-zinc-700">#{tag.name}</span>
          </p>
        </div>

        {/* Articles Grid */}
        <div>
          {/* Header with count */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg sm:text-xl font-bold text-[#252525]">
                Related Articles
              </h2>
            </div>
            <span className="text-sm font-medium text-zinc-500 bg-zinc-100 px-3.5 py-1.5 rounded-full">
              {blogs.length} {blogs.length === 1 ? "article" : "articles"}
            </span>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-16 bg-white border border-zinc-200/80 rounded-2xl">
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hash className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-zinc-500 font-medium">
                  No articles tagged with #{tag.name} yet.
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                  Check back later for new content.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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

        {/* View All Articles Link */}
        {blogs.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              View all articles
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}