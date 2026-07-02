"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AdminShell from "@/components/admin/AdminShell";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface Category { id: number; name: string; slug: string; description: string | null; }
interface UserProfile { id: number; name: string; email: string; }

export default function CategoryEditClient({
  category,
  user,
}: {
  category: Category;
  user: UserProfile | null;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(category.name);
  const [slug, setSlug] = React.useState(category.slug);
  const [description, setDescription] = React.useState(category.description ?? "");
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const autoSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await apiRequest(`/api/categories/${category.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, slug, description }),
      });
      toast.success("Category updated!");
      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      if (err.errors) setErrors(err.errors);
      toast.error(err.message || "Failed to update category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell activePage="Manage Categories" headerTitle={`Edit Category: ${category.name}`} user={user}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Edit Category</h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Update details for <span className="text-brand-orange">{category.name}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit}
          className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
            <Sparkles className="h-4 w-4" />
            Category Details
          </h4>

          <Input
            label="Category Name"
            placeholder="e.g. SEO & Technical Marketing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            error={errors.name?.[0]}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">URL Slug</label>
              <button type="button" onClick={() => setSlug(autoSlug(name))}
                className="text-[10px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 cursor-pointer">
                <Sparkles className="h-3 w-3" /> Regenerate
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs text-zinc-400 font-semibold select-none">/categories/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full h-10 pl-[90px] pr-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
              />
            </div>
            {errors.slug?.[0] && <p className="text-[10px] font-semibold text-red-500">{errors.slug[0]}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
            />
            {errors.description?.[0] && <p className="text-[10px] font-semibold text-red-500">{errors.description[0]}</p>}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={submitting}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-6 h-11 rounded-xl shadow-md shadow-brand-orange/15 flex items-center gap-2 cursor-pointer">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/categories")}
              className="border-zinc-200 dark:border-zinc-800 font-bold px-5 h-11 rounded-xl cursor-pointer">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
