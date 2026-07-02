import Link from "next/link";
import Image from "next/image";
import { Calendar, User, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Post {
  id: number;
  title: string;
  slug: string;
  short_description?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  published_at?: string | null;
  read_time?: number | null;
  is_featured?: boolean;
  author?: { id: number; name: string; avatar_url?: string | null } | null;
  categories?: { id: number; name: string; slug: string }[];
}

interface PostCardProps {
  post: Post;
  blogSlug: string;
  /** "large" = featured 2-col card, "small" = 3-col grid card */
  size?: "large" | "small";
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostCard({ post, blogSlug, size = "small" }: PostCardProps) {
  const category = post.categories?.[0];
  const date = formatDate(post.published_at);
  const href = `/blogs/${blogSlug}/${post.slug}`;

  return (
    <article
      className={cn(
        "group bg-white rounded-xl overflow-hidden border border-zinc-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300 flex flex-col",
        size === "large" && "shadow-sm"
      )}
      aria-label={post.title}
    >
      {/* Cover image */}
      <Link
        href={href}
        className={cn(
          "block relative overflow-hidden bg-zinc-100 shrink-0",
          size === "large" ? "aspect-[16/9]" : "aspect-[16/9]"
        )}
        tabIndex={-1}
        aria-hidden="true"
      >
        {post.image_url ? (
          <Image
            src={post.image_url}
            alt={post.image_alt || post.title}
            fill
            priority={size === "large"}
            sizes={
              size === "large"
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <FileText className="h-14 w-14 text-blue-200" />
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Category badge */}
        {category && (
          <div className="mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
              {category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <Link href={href} className="block mb-2">
          <h2
            className={cn(
              "font-bold text-zinc-900 leading-snug group-hover:text-blue-700 transition-colors",
              size === "large" ? "text-xl line-clamp-2" : "text-[15px] line-clamp-3"
            )}
          >
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.short_description && (
          <p
            className={cn(
              "text-zinc-500 leading-relaxed mb-4",
              size === "large" ? "text-sm line-clamp-3" : "text-xs line-clamp-3"
            )}
          >
            {post.short_description}
          </p>
        )}

        {/* Meta row — author + date */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-zinc-100">
          {/* Author */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              {post.author?.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <User className="h-3 w-3 text-blue-400" />
              )}
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 truncate">
              {post.author?.name ?? "Web Creation Nepal"}
            </span>
          </div>

          {/* Date */}
          {date && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Calendar className="h-3 w-3 text-zinc-400" />
              <span className="text-[11px] text-zinc-400 font-medium">{date}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
