"use client";

import * as React from "react";
import { Plus, Search, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminShell from "@/components/admin/AdminShell";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RedirectRule {
  id: number;
  source_url: string;
  destination_url: string;
  status_code: number;
}

export default function AdminRedirectsPage() {
  const { user, loading } = useAdminAuth();

  const [redirects,       setRedirects]       = React.useState<RedirectRule[]>([]);
  const [dataLoading,     setDataLoading]     = React.useState(true);
  const [searchQuery,     setSearchQuery]     = React.useState("");
  const [showModal,       setShowModal]       = React.useState(false);
  const [sourceUrl,       setSourceUrl]       = React.useState("");
  const [destinationUrl,  setDestinationUrl]  = React.useState("");
  const [statusCode,      setStatusCode]      = React.useState(301);
  const [submitting,      setSubmitting]      = React.useState(false);

  const fetchRedirects = React.useCallback(async () => {
    try {
      const res = await apiRequest("/api/redirects");
      setRedirects(res.data || []);
    } catch {
      toast.error("Failed to load redirect rules.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!loading && user) fetchRedirects();
  }, [loading, user, fetchRedirects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceUrl || !destinationUrl) {
      toast.error("Both source and destination URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("/api/redirects", {
        method: "POST",
        body: JSON.stringify({ source_url: sourceUrl, destination_url: destinationUrl, status_code: statusCode }),
      });
      toast.success("Redirect rule created!");
      setSourceUrl(""); setDestinationUrl(""); setStatusCode(301);
      setShowModal(false);
      await fetchRedirects();
    } catch (err: any) {
      toast.error(err.message || "Failed to create redirect.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = React.useMemo(() =>
    redirects.filter((r) =>
      r.source_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination_url.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [redirects, searchQuery]
  );

  if (loading || dataLoading) return <AdminPageLoader message="Loading redirect routing system..." />;

  return (
    <>
      <AdminShell
        activePage="SEO Redirects"
        headerTitle="SEO Redirect Rules"
        user={user}
        headerRight={
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Redirect Rule
          </Button>
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

          {/* Search + count bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/60 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by source or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955/40 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-650 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="text-xs font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest shrink-0">
              {filtered.length} {filtered.length === 1 ? "Rule" : "Rules"}
            </div>
          </div>

          {/* Table or empty state */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/20 dark:bg-zinc-900/10">
              <Link2 className="h-12 w-12 text-zinc-350 dark:text-zinc-650 mx-auto mb-4" />
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">No Redirect Rules</h3>
              <p className="text-zinc-550 dark:text-zinc-450 text-sm max-w-sm mx-auto mt-1 leading-relaxed">
                Map legacy paths to current URLs to preserve SEO equity and avoid broken links.
              </p>
              <Button onClick={() => setShowModal(true)} className="mt-6 bg-brand-orange text-white font-bold cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add First Rule
              </Button>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/20 select-none">
                  <TableRow>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-zinc-500">Source Path</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-zinc-500">Destination</TableHead>
                    <TableHead className="font-bold text-[11px] uppercase tracking-wider text-zinc-500 text-center w-36">HTTP Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((rule) => (
                    <TableRow key={rule.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/15">
                      <TableCell className="font-mono text-xs text-zinc-900 dark:text-slate-100 py-4 max-w-xs truncate">
                        {rule.source_url}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-550 dark:text-zinc-400 py-4 max-w-xs truncate">
                        {rule.destination_url}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <span className={cn(
                          "inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
                          rule.status_code === 301
                            ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30"
                            : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-900/30"
                        )}>
                          {rule.status_code}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </AdminShell>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/30 dark:bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleCreate}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 mx-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-black text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Link2 className="h-5 w-5 text-brand-orange" />
                New Redirect Rule
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            {[
              { label: "Source Path",        value: sourceUrl,       set: setSourceUrl,       placeholder: "/old-post-slug" },
              { label: "Destination Target", value: destinationUrl,  set: setDestinationUrl,  placeholder: "/posts/new-slug" },
            ].map(({ label, value, set, placeholder }) => (
              <div key={label} className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-455">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-xs font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
                />
              </div>
            ))}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-450 dark:text-zinc-455">HTTP Code</label>
              <select
                value={statusCode}
                onChange={(e) => setStatusCode(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/20"
              >
                <option value={301}>301 — Permanent Redirect</option>
                <option value={302}>302 — Temporary Redirect</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="font-bold text-zinc-650 cursor-pointer">Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold cursor-pointer">
                {submitting ? "Saving..." : "Save Rule"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
