"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import PostForm from "@/components/admin/PostForm";

interface UserProfile { id: number; name: string; email: string }

interface PostViewClientProps {
  initialPost: any;
  user: UserProfile | null;
}

export default function PostViewClient({ initialPost, user }: PostViewClientProps) {
  const router = useRouter();

  // Safe mapping — handles both direct author_id and nested author object
  const mappedPost = {
    ...initialPost,
    blog_id: initialPost.blog_id ? String(initialPost.blog_id) : "",
    author_id: initialPost.author_id
      ? String(initialPost.author_id)
      : initialPost.author?.id
        ? String(initialPost.author.id)
        : "",
    category_ids: initialPost.categories?.map((c: any) => c.id) || [],
    tag_ids: initialPost.tags?.map((t: any) => t.id) || [],
  };

  return (
    <AdminShell
      activePage="Manage Posts"
      headerTitle="View Post"
      user={user}
      headerRight={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/posts")}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Posts
          </Button>
          <Button
            size="sm"
            onClick={() => router.push(`/admin/posts/${initialPost.id}/edit`)}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
            Edit Post
          </Button>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">View Post</h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Read-only view of all post attributes, taxonomy, FAQs, and SEO meta.
          </p>
        </div>

        <PostForm
          mode="view"
          initialData={mappedPost}
          onCancel={() => router.push("/admin/posts")}
        />
      </div>
    </AdminShell>
  );
}
