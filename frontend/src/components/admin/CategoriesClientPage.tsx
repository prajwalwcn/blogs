"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface CategoriesClientPageProps {
  initialCategories: Category[];
  user: UserProfile | null;
}

export default function CategoriesClientPage({ initialCategories, user }: CategoriesClientPageProps) {
  const router = useRouter();
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [search, setSearch] = React.useState("");

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? Blogs in this category will lose this association.")) return;
    try {
      await apiRequest(`/api/categories/${id}`, { method: "DELETE" });
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Category deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category.");
    }
  };

  return (
    <AdminShell
      activePage="Manage Categories"
      headerTitle="Manage Categories"
      user={user}
      headerRight={
        <Button
          onClick={() => router.push("/admin/categories/create")}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs flex items-center gap-1.5 rounded-xl cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              Categories
            </h1>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
              Organise your blog content with taxonomy categories.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-250/80 dark:border-zinc-800/80 rounded-2xl p-12 text-center shadow-sm">
            <FolderOpen className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 font-semibold text-sm">
              {search ? "No categories match your search." : "No categories yet. Click 'Add Category' to create one."}
            </p>
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/85 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Name</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hidden md:table-cell">Slug</th>
                  <th className="text-left px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hidden lg:table-cell">Description</th>
                  <th className="px-6 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-zinc-900 dark:text-white">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <code className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                        {cat.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {cat.description || <span className="italic text-zinc-350 dark:text-zinc-600">—</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/categories/${cat.id}/edit`)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
