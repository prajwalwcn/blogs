"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, Globe, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  image_url: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface AuthorsClientPageProps {
  initialAuthors: Author[];
  user: UserProfile | null;
}

export default function AuthorsClientPage({ initialAuthors, user }: AuthorsClientPageProps) {
  const router = useRouter();
  const [authors, setAuthors] = React.useState<Author[]>(initialAuthors);
  const [search, setSearch] = React.useState("");

  const filteredAuthors = authors.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.bio && a.bio.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (authorId: number) => {
    if (!confirm("Are you sure you want to delete this author profile? All blogs and posts assigned to this author will remain, but their author reference may be cleared.")) {
      return;
    }

    try {
      await apiRequest(`/api/authors/${authorId}`, {
        method: "DELETE",
      });
      setAuthors(authors.filter((a) => a.id !== authorId));
      toast.success("Author profile deleted successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete author.");
    }
  };

  return (
    <AdminShell
      activePage="Manage Authors"
      headerTitle="Manage Authors"
      user={user}
      headerRight={
        <Button
          onClick={() => router.push("/admin/authors/create")}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Author
        </Button>
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Header Title block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Authors
            </h1>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
              Create, modify, and delete author profiles who write posts and manage blogs.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Content list */}
        {filteredAuthors.length === 0 ? (
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-250/80 dark:border-zinc-800/80 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-zinc-500 dark:text-zinc-400 font-semibold text-sm">
              {search ? "No authors match your search criteria." : "No author profiles found. Click 'Add Author' to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author) => (
              <div
                key={author.id}
                className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/85 p-6 rounded-2xl shadow-sm backdrop-blur-md flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-700 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={author.image_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"}
                        alt={author.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white group-hover:text-brand-orange transition-colors">
                        {author.name}
                      </h3>
                      <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                        /authors/{author.slug}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-650 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {author.bio || <span className="italic text-zinc-400">No bio provided.</span>}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/60 pt-4 mt-2">
                  {/* Social links */}
                  <div className="flex items-center gap-2">
                    {author.twitter_handle ? (
                      <a
                        href={`https://x.com/${author.twitter_handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-zinc-200 dark:text-zinc-800">
                        <Globe className="h-4 w-4" />
                      </span>
                    )}

                    {author.linkedin_url ? (
                      <a
                        href={author.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
                      >
                        <Link2 className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-zinc-200 dark:text-zinc-800">
                        <Link2 className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/authors/${author.id}/edit`)}
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(author.id)}
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AdminShell>
  );
}
