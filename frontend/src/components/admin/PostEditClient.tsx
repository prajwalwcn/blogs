"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import PostForm, { PostFormData } from "@/components/admin/PostForm";

interface UserProfile { id: number; name: string; email: string }

interface PostEditClientProps {
  initialPost: any;
  user: UserProfile | null;
}

export default function PostEditClient({ initialPost, user }: PostEditClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (data: PostFormData) => {
    setSubmitting(true);
    setErrors({});
    try {
      await apiRequest(`/api/posts/${initialPost.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Post updated successfully!");
      router.push("/admin/posts");
      router.refresh();
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
        toast.error("Validation failed", { description: "Please check the highlighted fields." });
      } else {
        toast.error(err.message || "Failed to update post.");
      }
    } finally {
      setSubmitting(false);
    }
  };

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
      headerTitle="Edit Post"
      user={user}
      headerRight={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/posts")}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Edit Post</h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Modify title, cover image, taxonomies, FAQs, and SEO details.
          </p>
        </div>

        <PostForm
          mode="edit"
          initialData={mappedPost}
          onSubmit={handleSubmit}
          isLoading={submitting}
          errors={errors}
          onCancel={() => router.push("/admin/posts")}
        />
      </div>
    </AdminShell>
  );
}
