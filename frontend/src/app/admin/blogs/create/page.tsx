"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, removeAuthToken, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import BlogForm, { BlogFormData } from "@/components/admin/BlogForm";
import AdminShell from "@/components/admin/AdminShell";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function AdminBlogCreatePage() {
  const router = useRouter();

  // Auth & UI States
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/wcnadmin");
      return;
    }

    const loadInitialData = async () => {
      try {
        const authData = await apiRequest("/api/me");
        setUser(authData.user);
      } catch (err: any) {
        if (err.status === 401) {
          removeAuthToken();
          router.push("/wcnadmin");
        }
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [router]);

  const handleSubmit = async (data: BlogFormData) => {
    setSubmitting(true);
    setErrors({});

    const payload = {
      name: data.name,
      slug: data.slug || undefined,
      excerpt: data.excerpt || undefined,
      description: data.description || undefined,
      image_url: data.image_url || undefined,
      image_alt: data.image_alt || undefined,
      image_caption: data.image_caption || undefined,
      meta_title: data.meta_title || undefined,
      meta_description: data.meta_description || undefined,
      meta_keywords: data.meta_keywords || undefined,
      author_id: data.author_id ?? undefined,
      read_time: data.read_time ?? undefined,
      category_ids: data.category_ids || [],
      tag_ids: data.tag_ids || [],
      allow_comments: data.allow_comments ?? true,
      faq: data.faq || [],
    };

    try {
      await apiRequest("/api/blogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Blog created successfully!");
      router.push("/admin/blogs");
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
        toast.error("Form validation failed", {
          description: "Please check the highlighted fields.",
        });
      } else {
        toast.error(err.message || "Failed to create blog.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mb-4" />
        <p className="text-zinc-550 dark:text-zinc-400 text-sm font-semibold">
          Loading system resources...
        </p>
      </div>
    );
  }

  return (
    <AdminShell
      activePage="Manage Blogs"
      headerTitle="Add New Blog Schema"
      user={user}
      headerRight={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/blogs")}
          className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Back to Blogs</span>
        </Button>
      }
    >
      {/* Form container body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Add New Blog Schema
          </h2>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Configure cover image dimensions and SEO structures immediately on registration.
          </p>
        </div>

        <BlogForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={submitting}
          errors={errors}
          onCancel={() => router.push("/admin/blogs")}
        />
      </div>
    </AdminShell>
  );
}
