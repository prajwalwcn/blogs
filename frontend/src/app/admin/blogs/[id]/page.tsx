"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, removeAuthToken, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import BlogForm from "@/components/admin/BlogForm";
import AdminShell from "@/components/admin/AdminShell";

interface Blog {
  id: number;
  name: string;
  slug: string;
  description: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_caption: string | null;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminBlogViewPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);

  // Auth & UI States
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [blogData, setBlogData] = React.useState<Blog | null>(null);
  const [loading, setLoading] = React.useState(true);

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

        // Fetch all blogs and find matching ID or Slug
        const blogsResponse = await apiRequest("/api/blogs");
        const found = (blogsResponse.data || []).find(
          (b: Blog) => b.id.toString() === id || b.slug === id
        );

        if (found) {
          setBlogData(found);
        } else {
          toast.error("Requested blog not found.");
          router.push("/admin/blogs");
        }
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
  }, [router, id]);

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
      headerTitle="View Blog Information"
      user={user}
      headerRight={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/blogs")}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Back to Blogs</span>
          </Button>
          {blogData && (
            <Button
              size="sm"
              onClick={() => router.push(`/admin/blogs/${blogData.id}/edit`)}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold cursor-pointer"
            >
              Edit Blog
            </Button>
          )}
        </div>
      }
    >
      {/* Form container body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            View Blog Information
          </h2>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Read-only access to Cover Image details and SEO markup schema.
          </p>
        </div>

        {blogData && (
          <BlogForm
            mode="view"
            initialData={{
              name: blogData.name,
              slug: blogData.slug,
              description: blogData.description,
              image_url: blogData.image_url || "",
              image_alt: blogData.image_alt || "",
              image_caption: blogData.image_caption || "",
              meta_title: blogData.meta_title || "",
              meta_description: blogData.meta_description || "",
              meta_keywords: blogData.meta_keywords || "",
            }}
            onCancel={() => router.push("/admin/blogs")}
          />
        )}
      </div>
    </AdminShell>
  );
}
