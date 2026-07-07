"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { apiRequest, removeAuthToken, getAuthToken } from "@/lib/api";
import { toast } from "sonner";
import AdminShell from "@/components/admin/AdminShell";

interface Blog {
  id: number;
  name: string;
  slug: string;
  excerpt?: string | null;
  description: any;
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

export default function AdminBlogsPage() {
  const router = useRouter();

  // Auth & UI States
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch initial data
  const fetchBlogs = async () => {
    try {
      const response = await apiRequest("/api/blogs");
      setBlogs(response.data || []);
    } catch (err: any) {
      toast.error("Failed to load blogs data.");
    }
  };

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
        await fetchBlogs();
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

  // Delete Handler
  const handleDeleteBlog = async (blog: Blog) => {
    if (!confirm(`Are you sure you want to delete the blog "${blog.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiRequest(`/api/blogs/${blog.id}`, {
        method: "DELETE",
      });
      toast.success("Blog deleted successfully!");
      await fetchBlogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete the blog.");
    }
  };

  // Client Search filtering
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.description && (
        typeof blog.description === "string"
          ? blog.description.toLowerCase().includes(searchQuery.toLowerCase())
          : JSON.stringify(blog.description).toLowerCase().includes(searchQuery.toLowerCase())
      ))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">
          Loading system resources...
        </p>
      </div>
    );
  }

  return (
    <AdminShell
      activePage="Manage Blogs"
      headerTitle="Manage Blogs"
      user={user}
      headerRight={
        <Button
          size="sm"
          onClick={() => router.push("/admin/blogs/create")}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Blog</span>
        </Button>
      }
    >
      {/* Page Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Search Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white/60 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter blogs by name, slug, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955/40 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest shrink-0">
            Found {filteredBlogs.length} {filteredBlogs.length === 1 ? "Blog" : "Blogs"}
          </div>
        </div>

        {/* List Data Table */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-850 rounded-2xl bg-white/20 dark:bg-zinc-900/10 backdrop-blur-sm max-w-xl mx-auto">
            <Layers className="h-12 w-12 text-zinc-350 dark:text-zinc-650 mx-auto mb-4" />
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
              No Blogs Found
            </h3>
            <p className="text-zinc-500 dark:text-zinc-455 text-sm max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery
                ? "Adjust your search filters to find matching blogs."
                : "Create a blog to organize technical columns and SEO-optimized post segments."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push("/admin/blogs/create")}
                className="mt-6 bg-brand-orange text-white font-bold cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Create Blog</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/40">
                <TableRow>
                  <TableHead className="w-16 pl-6">Cover</TableHead>
                  <TableHead className="w-12">ID</TableHead>
                  <TableHead className="w-64">Name / Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-44 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBlogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/25 transition-all">
                    {/* Cover image preview cell */}
                    <TableCell className="pl-6 py-3">
                      <div className="h-10 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center">
                        {blog.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={blog.image_url}
                            alt={blog.image_alt || blog.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                    </TableCell>

                    {/* ID cell */}
                    <TableCell className="font-mono text-xs font-bold text-zinc-400">
                      {blog.id}
                    </TableCell>

                    {/* Name / Slug Cell */}
                    <TableCell>
                      <div>
                        <p className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">
                          {blog.name}
                        </p>
                        <span className="text-[10px] text-brand-green font-bold font-mono">
                          /{blog.slug}
                        </span>
                      </div>
                    </TableCell>

                    {/* Description Cell */}
                    <TableCell className="max-w-md truncate text-xs text-zinc-550 dark:text-zinc-400 font-medium">
                      {blog.excerpt || (typeof blog.description === "string" ? blog.description : "—")}
                    </TableCell>

                    {/* Actions Cell */}
                    <TableCell className="text-right pr-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/blogs/${blog.slug}`)}
                          className="text-zinc-650 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60 h-8 px-2.5 font-bold text-xs cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          <span>View</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/blogs/${blog.id}/edit`)}
                          className="text-brand-orange hover:text-brand-orange-hover hover:bg-brand-orange/5 h-8 px-2.5 font-bold text-xs cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          <span>Edit</span>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBlog(blog)}
                          className="text-red-550 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 h-8 px-2.5 font-bold text-xs cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
