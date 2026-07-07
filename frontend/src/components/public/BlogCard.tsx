import Link from "next/link";
import Image from "next/image";
import { Calendar, FileText, PenTool, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlogCardProps {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  description?: Array<{ title: string; content: string }> | string | null;
  meta_keywords?: string | null;
  created_at?: string | null;
  read_time?: number | null;
  author?: {
    id: number;
    name: string;
    slug?: string | null;
    avatar_url?: string | null;
  } | null;
  image?: {
    url: string | null;
    alt?: string | null;
  };
  /** "large" — featured top row (2-col), "small" — bottom row (3-col) */
  size?: "large" | "small";
}

export default function BlogCard({
  name,
  slug,
  excerpt,
  description,
  meta_keywords,
  created_at,
  read_time,
  author,
  image,
  size = "small",
}: BlogCardProps) {
  // First keyword becomes the "category" label
  const category = meta_keywords
    ? meta_keywords.split(",").map((k) => k.trim()).filter(Boolean)[0]
    : null;

  const href = `/blogs/${slug}`;

  // Simple date formatter to match "June 30, 2026" formatting
  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "June 30, 2026"; // Mockup fallback

  // Validate and provide a real image URL fallback if the DB contains mock websites/non-images
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
      // Return a premium tech/business stock photo based on the ID/Name hash to keep it stable
      const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const stockImages = [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&h=450&q=80", // Marketing/SEO
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&h=450&q=80", // Dev diary
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&h=450&q=80", // Tech code
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&h=450&q=80", // Backend server
        "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&h=450&q=80", // UI Design
      ];
      return stockImages[hash % stockImages.length];
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
      const cleanUrl = url.startsWith("/") ? url : `/${url}`;
      return `${API_URL}${cleanUrl}`;
    }
    return url;
  };

  const finalImageUrl = getValidImageUrl(image?.url);

  // Excerpt or description fallback
  const displaySummary = excerpt || (typeof description === "string" ? description : "");

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-300",
        "bg-[#f4f7fc]" // Matches the ultra-light soft blue/gray container background
      )}
      aria-label={name}
    >
      {/* ── Cover Image ─────────────────────────────────────── */}
      <Link
        href={href}
        className={cn(
          "block relative overflow-hidden shrink-0 bg-zinc-100",
          size === "large" ? "aspect-[16/10]" : "aspect-[4/3]"
        )}
        tabIndex={-1}
        aria-hidden="true"
      >
        {finalImageUrl ? (
          <Image
            src={finalImageUrl}
            alt={image?.alt || name}
            fill
            priority={size === "large"}
            loading={size === "large" ? "eager" : "lazy"}
            {...((size === "large" ? { fetchPriority: "high" } : {}) as any)}
            sizes={
              size === "large"
                ? "(max-width: 640px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, 33vw"
            }
            className="object-cover group-hover:scale-102 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
            <FileText className="h-12 w-12 text-white/70" />
          </div>
        )}
      </Link>

      {/* ── Card Body ───────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-6 pt-5 pb-6 bg-[#f4f7fc]">
        
        {/* Category Tag */}
        {category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-2.5">
            {category}
          </p>
        )}

        {/* Title */}
        <Link href={href} className="block mb-3">
          <h2
            className={cn(
              "font-semibold text-[#252525] leading-[30px] transition-colors group-hover:text-blue-600",
              size === "large"
                ? "text-[24px] line-clamp-2"
                : "text-[22px] line-clamp-2"
            )}
          >
            {name}
          </h2>
        </Link>

        {/* Excerpt/Description */}
        {displaySummary && (
          <p className="text-[16px] font-normal text-[#3D3D3D] leading-[24px] line-clamp-3 mb-6">
            {displaySummary}
          </p>
        )}

        {/* ── Meta Footer Row ────────────────────────────────── */}
        <div className="mt-auto flex items-center justify-between gap-4 pt-2 border-t border-zinc-200/50">
          
          {/* Author info (Left side) */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-[#e1ecd9] flex items-center justify-center shrink-0">
              <PenTool className="h-3 w-3 text-[#5d8246]" />
            </div>
            {author?.slug ? (
              <Link
                href={`/authors/${author.slug}`}
                className="text-[14px] font-medium text-[#5D5D5D] hover:text-blue-600 transition-colors leading-[24px] truncate cursor-pointer"
              >
                {author.name}
              </Link>
            ) : (
              <span className="text-[14px] font-medium text-[#5D5D5D] leading-[24px] truncate">
                {author?.name || "Web Creation Nepal"}
              </span>
            )}
          </div>

          {/* Read Time (Middle/Right) */}
          {read_time && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-[14px] font-medium text-[#5D5D5D] leading-[24px] whitespace-nowrap">
                {read_time} min read
              </span>
            </div>
          )}

        </div>
      </div>
    </article>
  );
}
