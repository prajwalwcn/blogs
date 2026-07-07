"use client";

import * as React from "react";
import { Plus, Trash2, Edit2, Save, X, Loader2, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminShell from "@/components/admin/AdminShell";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface MenuItem {
  id: number;
  label: string;
  url: string;
  image_url?: string | null;
  order: number;
}

export default function AdminMenusPage() {
  const { user, loading } = useAdminAuth();

  const [menus, setMenus] = React.useState<MenuItem[]>([]);
  const [fetching, setFetching] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Edit / Add Form State
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [label, setLabel] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [order, setOrder] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const loadMenus = async () => {
    try {
      const res = await apiRequest("/api/menus");
      setMenus(res.data || []);
    } catch {
      toast.error("Failed to load navigation menus.");
    } finally {
      setFetching(false);
    }
  };

  React.useEffect(() => {
    loadMenus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) {
      toast.error("Label and URL are required.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Update
        await apiRequest(`/api/menus/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ label, url, order, image_url: imageUrl || null }),
        });
        toast.success("Menu item updated successfully!");
      } else {
        // Create
        await apiRequest("/api/menus", {
          method: "POST",
          body: JSON.stringify({ label, url, order, image_url: imageUrl || null }),
        });
        toast.success("Menu item added successfully!");
      }
      resetForm();
      loadMenus();
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (menu: MenuItem) => {
    setEditingId(menu.id);
    setLabel(menu.label);
    setUrl(menu.url);
    setImageUrl(menu.image_url || "");
    setOrder(menu.order);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      await apiRequest(`/api/menus/${id}`, { method: "DELETE" });
      toast.success("Menu item deleted successfully!");
      loadMenus();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu item.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const resData = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });
      setImageUrl(resData.url);
      toast.success("Menu icon uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload menu icon.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setUrl("");
    setImageUrl("");
    setOrder(menus.length ? Math.max(...menus.map((m) => m.order)) + 1 : 1);
  };

  if (loading || fetching) {
    return <AdminPageLoader />;
  }

  return (
    <AdminShell activePage="Manage Menus" headerTitle="Manage Navigation Menus" user={user}>
      <div className="space-y-8 max-w-5xl mx-auto p-4 md:p-6">
        
        {/* Form Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 mb-4">
            {editingId ? "Edit Menu Item" : "Add New Menu Item"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Menu Label
              </label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Services"
                required
                className="h-10 text-sm"
              />
            </div>
            
            <div className="space-y-1.5 md:col-span-4">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Target Link / URL
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. /services"
                required
                className="h-10 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">
                Menu Icon / Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  disabled={uploading}
                  onClick={triggerFileSelect}
                  variant="outline"
                  className="h-10 text-xs px-3 font-semibold cursor-pointer border-dashed border-zinc-300 hover:border-zinc-400 flex items-center gap-1.5 w-full justify-center"
                >
                  <Upload className="h-4 w-4 text-zinc-500" />
                  {uploading ? "Uploading..." : imageUrl ? "Change Icon" : "Upload Icon"}
                </Button>
                {imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 bg-zinc-50 rounded border border-zinc-200 flex items-center justify-center group overflow-hidden">
                    <img
                      src={imageUrl}
                      alt=""
                      className="h-7 w-7 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                      title="Remove Icon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Display Order
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  placeholder="1"
                  required
                  className="h-10 text-sm"
                />
                
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-orange hover:bg-brand-orange/95 text-white h-10 px-4 flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingId ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>

                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="h-10 px-3 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* List Table Container */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Active Menus Directory
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              {menus.length} items registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Label</th>
                  <th className="px-6 py-3.5">Link Path</th>
                  <th className="px-6 py-3.5">Icon Path</th>
                  <th className="px-6 py-3.5 w-24 text-center">Order</th>
                  <th className="px-6 py-3.5 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm text-zinc-700 dark:text-zinc-300">
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-400 text-xs">
                      No dynamic menus registered in the database. Add one above.
                    </td>
                  </tr>
                ) : (
                  menus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-100">
                        <div className="flex items-center gap-2">
                          {menu.image_url && (
                            <img
                              src={menu.image_url}
                              alt=""
                              className="h-6 w-6 object-contain bg-zinc-50 rounded p-0.5 border border-zinc-150 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          )}
                          <span>{menu.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-500">
                        {menu.url}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-450 italic truncate max-w-[200px]">
                        {menu.image_url || "—"}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-zinc-600">
                        {menu.order}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(menu)}
                            className="h-8 w-8 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(menu.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}
