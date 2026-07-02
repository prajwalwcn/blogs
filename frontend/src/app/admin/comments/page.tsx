"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Check,
  Trash2,
  X,
  Clock,
  CheckCircle2,
  User,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Comment {
  id: number;
  name: string;
  email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  blog: { id: number; name: string; slug: string } | null;
}

type FilterTab = "all" | "pending" | "approved";

export default function AdminCommentsPage() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();

  const [comments,      setComments]      = React.useState<Comment[]>([]);
  const [dataLoading,   setDataLoading]   = React.useState(true);
  const [searchQuery,   setSearchQuery]   = React.useState("");
  const [activeTab,     setActiveTab]     = React.useState<FilterTab>("all");
  const [processingIds, setProcessingIds] = React.useState<Set<number>>(new Set());

  const fetchComments = React.useCallback(async () => {
    try {
      const res = await apiRequest("/api/comments");
      setComments(res.data || []);
    } catch {
      toast.error("Failed to load comments.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!loading && user) fetchComments();
  }, [loading, user, fetchComments]);

  const withProcessing = async (id: number, fn: () => Promise<void>) => {
    setProcessingIds((p) => new Set(p).add(id));
    try { await fn(); }
    finally {
      setProcessingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleApprove = (id: number) =>
    withProcessing(id, async () => {
      await apiRequest(`/api/comments/${id}/approve`, { method: "PUT" });
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, is_approved: true } : c)));
      toast.success("Comment approved!");
    });

  const handleDelete = (id: number) => {
    if (!confirm("Permanently delete this comment?")) return;
    withProcessing(id, async () => {
      await apiRequest(`/api/comments/${id}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comment deleted.");
    });
  };

  const filtered = React.useMemo(() =>
    comments.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q) ||
        (c.blog?.name ?? "").toLowerCase().includes(q);
      const matchTab =
        activeTab === "all" ||
        (activeTab === "pending"  && !c.is_approved) ||
        (activeTab === "approved" && c.is_approved);
      return matchSearch && matchTab;
    }),
    [comments, searchQuery, activeTab]
  );

  const pendingCount  = comments.filter((c) => !c.is_approved).length;
  const approvedCount = comments.filter((c) =>  c.is_approved).length;

  if (loading || dataLoading) return <AdminPageLoader message="Loading comment moderation panel..." />;

  return (
    <AdminShell
      activePage="Comments"
      headerTitle="Comment Moderation"
      user={user}
      headerRight={
        pendingCount > 0 ? (
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/30">
            {pendingCount} Awaiting Review
          </span>
        ) : undefined
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Comments", value: comments.length,  icon: MessageSquare, color: "text-zinc-500" },
            { label: "Pending Review", value: pendingCount,      icon: Clock,         color: "text-amber-500" },
            { label: "Approved",       value: approvedCount,     icon: CheckCircle2,  color: "text-emerald-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 backdrop-blur-md">
              <Icon className={cn("h-5 w-5 shrink-0", color)} />
              <div>
                <div className="text-xl font-black text-zinc-900 dark:text-white">{value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/60 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md">
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-950/60 p-1 rounded-lg text-xs font-bold">
            {(["all", "pending", "approved"] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-md capitalize transition-all cursor-pointer",
                  activeTab === tab
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search comments..."
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
        </div>

        {/* Comments List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/20 dark:bg-zinc-900/10">
            <MessageSquare className="h-12 w-12 text-zinc-350 dark:text-zinc-650 mx-auto mb-4" />
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">No Comments Found</h3>
            <p className="text-zinc-500 dark:text-zinc-450 text-sm mt-1">
              {searchQuery ? "Try adjusting your search term." : "No comments match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((comment) => (
              <div
                key={comment.id}
                className={cn(
                  "bg-white/80 dark:bg-zinc-900/40 border rounded-xl p-5 backdrop-blur-md shadow-sm transition-all",
                  comment.is_approved
                    ? "border-zinc-200/80 dark:border-zinc-800/80"
                    : "border-amber-200/80 dark:border-amber-900/30"
                )}
              >
                <div className="flex gap-4">
                  <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">{comment.name}</span>
                      <span className="text-xs text-zinc-400 font-mono truncate max-w-[160px]">{comment.email}</span>
                      <span className={cn(
                        "ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        comment.is_approved
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30"
                          : "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200 dark:border-amber-900/30"
                      )}>
                        {comment.is_approved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">{comment.content}</p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                        {comment.blog && (
                          <button
                            onClick={() => router.push(`/admin/blogs/${comment.blog!.id}/edit`)}
                            className="flex items-center gap-1 hover:text-brand-orange transition-colors font-semibold"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[180px]">{comment.blog.name}</span>
                          </button>
                        )}
                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                        <span>{new Date(comment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!comment.is_approved && (
                          <button
                            onClick={() => handleApprove(comment.id)}
                            disabled={processingIds.has(comment.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={processingIds.has(comment.id)}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
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
