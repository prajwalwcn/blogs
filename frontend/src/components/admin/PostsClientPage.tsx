"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Eye, Pencil, Trash2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import AdminShell from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Category { id: number; name: string; slug: string }
interface Tag       { id: number; name: string; slug: string }
interface Author    { id: number; name: string }

interface Post {
  id: number;
  blog_id: number;
  title: string;
  slug: string;
  short_description: string;
  read_time: number;
  image_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  priority: number;
  published_at: string | null;
  author?: Author;
  categories?: Category[];
  tags?: Tag[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

interface UserProfile { id: number; name: string; email: string }

interface PostsClientPageProps {
  initialPosts: Post[];
  initialMeta: PaginationMeta;
  user: UserProfile | null;
  searchParams: { search?: string; page?: string };
}

export default function PostsClientPage({
  initialPosts,
  initialMeta,
  user,
  searchParams,
}: PostsClientPageProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [posts,       setPosts]       = React.useState<Post[]>(initialPosts);
  const [meta,        setMeta]        = React.useState<PaginationMeta>(initialMeta);
  const [searchQuery, setSearchQuery] = React.useState(searchParams.search || "");

  // Sync when server re-renders with new data
  React.useEffect(() => {
    setPosts(initialPosts);
    setMeta(initialMeta);
  }, [initialPosts, initialMeta]);

  const navigate = (params: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParamsHook.toString());
    Object.entries(params).forEach(([k, v]) => v === null ? p.delete(k) : p.set(k, v));
    router.push(`/admin/posts?${p.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery ? { search: searchQuery, page: "1" } : { search: null });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    navigate({ search: null });
  };

  const handlePageChange = (page: number) => navigate({ page: String(page) });

  const handleDeletePost = async (post: Post) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/posts/${post.id}`, { method: "DELETE" });
      toast.success("Post deleted successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete post.");
    }
  };

  return (
    <AdminShell
      activePage="Manage Posts"
      headerTitle="Manage Posts"
      user={user}
      headerRight={
        <Button
          size="sm"
          onClick={() => router.push("/admin/posts/create")}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/60 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter posts by title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955/40 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-650 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
          <div className="text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest shrink-0">
            Found {meta.total} {meta.total === 1 ? "Post" : "Posts"}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-zinc-50/55 dark:bg-zinc-950/20">
              <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 hover:bg-transparent">
                <TableHead className="w-20 text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 py-3.5 pl-6">Image</TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 py-3.5">Post Title &amp; Author</TableHead>
                <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 py-3.5">Taxonomy Details</TableHead>
                <TableHead className="w-28 text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 py-3.5">Published Live</TableHead>
                <TableHead className="w-28 text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 py-3.5">Featured</TableHead>
                <TableHead className="w-36 text-right text-[11px] font-extrabold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 py-3.5 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {posts.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="text-center py-16 text-zinc-450 dark:text-zinc-500 font-semibold text-xs italic">
                    No posts found. Create your first post to get started.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow
                    key={post.id}
                    className="border-b border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50/30 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    {/* Thumbnail */}
                    <TableCell className="py-3.5 pl-6">
                      <div className="h-10 w-14 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                        {post.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                        ) : (
                          <FileText className="h-4 w-4 text-zinc-400" />
                        )}
                      </div>
                    </TableCell>

                    {/* Title + slug + author */}
                    <TableCell className="py-3.5 pr-4 max-w-[260px]">
                      <div className="truncate font-extrabold text-xs text-zinc-900 dark:text-white leading-tight">{post.title}</div>
                      <div className="truncate text-[10px] text-zinc-450 dark:text-zinc-500 font-semibold mt-0.5">/{post.slug}</div>
                      {post.author && (
                        <div className="flex items-center gap-1 text-[9px] text-brand-orange font-black uppercase tracking-wider mt-1.5">
                          <span className="h-1 w-1 rounded-full bg-brand-orange" />
                          By {post.author.name}
                        </div>
                      )}
                    </TableCell>

                    {/* Taxonomy */}
                    <TableCell className="py-3.5 pr-4 max-w-[200px]">
                      <div className="flex flex-col gap-1.5">
                        {post.categories && post.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.categories.map((c) => (
                              <span key={c.id} className="text-[9px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((t) => (
                              <span key={t.id} className="text-[8px] font-black uppercase tracking-wider text-brand-green bg-brand-green/5 dark:bg-brand-green/10 border border-brand-green/10 px-1.5 py-0.5 rounded">
                                #{t.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Published */}
                    <TableCell className="py-3.5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                        post.is_published
                          ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      )}>
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </TableCell>

                    {/* Featured */}
                    <TableCell className="py-3.5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                        post.is_featured
                          ? "bg-amber-100 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                      )}>
                        {post.is_featured ? "Featured" : "Regular"}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/admin/posts/${post.id}`)} className="h-8 w-8 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 cursor-pointer" title="View">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => router.push(`/admin/posts/${post.id}/edit`)} className="h-8 w-8 text-brand-orange hover:bg-brand-orange/5 border-zinc-200 dark:border-zinc-800 cursor-pointer" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDeletePost(post)} className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 border-zinc-200 dark:border-zinc-800 cursor-pointer" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-900 pt-4 px-2">
            <span className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page === 1}
                className="h-8 text-xs font-bold border-zinc-250 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >Previous</Button>

              {Array.from({ length: meta.last_page }).map((_, idx) => {
                const p = idx + 1;
                const isCurrent = p === meta.current_page;
                return (
                  <Button key={p} variant={isCurrent ? "default" : "outline"} size="sm"
                    onClick={() => handlePageChange(p)}
                    className={cn("h-8 w-8 text-xs font-bold cursor-pointer",
                      isCurrent ? "bg-brand-orange hover:bg-brand-orange-hover text-white" : "border-zinc-250 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    )}
                  >{p}</Button>
                );
              })}

              <Button
                variant="outline" size="sm"
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page === meta.last_page}
                className="h-8 text-xs font-bold border-zinc-250 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
              >Next</Button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
