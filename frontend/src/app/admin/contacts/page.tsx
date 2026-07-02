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
  Mail,
  Phone,
  MessageSquare,
  Reply,
  Eye,
  AlertCircle
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
}

type FilterTab = "all" | "unread" | "read" | "replied";

export default function AdminContactsPage() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();

  const [messages,      setMessages]      = React.useState<ContactMessage[]>([]);
  const [dataLoading,   setDataLoading]   = React.useState(true);
  const [searchQuery,   setSearchQuery]   = React.useState("");
  const [activeTab,     setActiveTab]     = React.useState<FilterTab>("all");
  const [processingIds, setProcessingIds] = React.useState<Set<number>>(new Set());

  const fetchMessages = React.useCallback(async () => {
    try {
      const res = await apiRequest("/api/contacts");
      setMessages(res.data || []);
    } catch {
      toast.error("Failed to load contact messages.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!loading && user) fetchMessages();
  }, [loading, user, fetchMessages]);

  const withProcessing = async (id: number, fn: () => Promise<void>) => {
    setProcessingIds((p) => new Set(p).add(id));
    try { await fn(); }
    finally {
      setProcessingIds((p) => { const n = new Set(p); n.delete(id); return n; });
    }
  };

  const handleUpdateStatus = (id: number, status: "unread" | "read" | "replied") =>
    withProcessing(id, async () => {
      const res = await apiRequest(`/api/contacts/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: res.data.status } : m)));
      toast.success(`Message marked as ${status}!`);
    });

  const handleDelete = (id: number) => {
    if (!confirm("Permanently delete this message?")) return;
    withProcessing(id, async () => {
      await apiRequest(`/api/contacts/${id}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted.");
    });
  };

  const filtered = React.useMemo(() =>
    messages.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q) ||
        (m.subject ?? "").toLowerCase().includes(q);
      const matchTab = activeTab === "all" || m.status === activeTab;
      return matchSearch && matchTab;
    }),
    [messages, searchQuery, activeTab]
  );

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount   = messages.filter((m) => m.status === "read").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;

  if (loading || dataLoading) return <AdminPageLoader message="Loading contact submissions..." />;

  return (
    <AdminShell
      activePage="Contact Messages"
      headerTitle="Contact Submissions"
      user={user}
      headerRight={
        unreadCount > 0 ? (
          <span className="text-[10px] font-black uppercase tracking-wider bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/30 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> {unreadCount} Unread
          </span>
        ) : undefined
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Messages", value: messages.length,  icon: Mail,         color: "text-zinc-500" },
            { label: "Unread Messages", value: unreadCount,      icon: AlertCircle,  color: "text-red-500" },
            { label: "Read / Reviewed", value: readCount,        icon: Eye,          color: "text-blue-500" },
            { label: "Replied Messages",value: repliedCount,     icon: Reply,        color: "text-emerald-500" },
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
            {(["all", "unread", "read", "replied"] as FilterTab[]).map((tab) => (
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
              placeholder="Search messages..."
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

        {/* Messages List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/20 dark:bg-zinc-900/10">
            <Mail className="h-12 w-12 text-zinc-350 dark:text-zinc-650 mx-auto mb-4" />
            <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">No Messages Found</h3>
            <p className="text-zinc-500 dark:text-zinc-450 text-sm mt-1">
              {searchQuery ? "Try adjusting your search query." : "No contact submissions match the selected filter."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "bg-white/80 dark:bg-zinc-900/40 border rounded-xl p-5 backdrop-blur-md shadow-sm transition-all",
                  message.status === "unread"
                    ? "border-red-200/80 dark:border-red-950/30 bg-red-50/5 dark:bg-red-950/2"
                    : message.status === "replied"
                    ? "border-emerald-250/80 dark:border-emerald-950/30"
                    : "border-zinc-200/80 dark:border-zinc-800/80"
                )}
              >
                <div className="flex gap-4">
                  <div className="h-9 w-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">{message.name}</span>
                      <span className="text-xs text-zinc-450 font-mono truncate max-w-[200px] flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {message.email}
                      </span>
                      {message.phone && (
                        <span className="text-xs text-zinc-450 font-mono truncate max-w-[150px] flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {message.phone}
                        </span>
                      )}
                      
                      <span className={cn(
                        "ml-auto text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        message.status === "unread"
                          ? "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/30"
                          : message.status === "replied"
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/30"
                          : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-900/30"
                      )}>
                        {message.status}
                      </span>
                    </div>

                    {message.subject && (
                      <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1 flex items-center gap-1">
                        Subject: <span className="text-zinc-850 dark:text-zinc-200 font-semibold">{message.subject}</span>
                      </h4>
                    )}

                    <div className="bg-zinc-50/50 dark:bg-zinc-950/30 p-3 rounded-lg border border-zinc-150/60 dark:border-zinc-850 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3 font-medium whitespace-pre-wrap">
                      {message.message}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-zinc-450 dark:text-zinc-500 font-medium">
                        <span>{new Date(message.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {message.status === "unread" && (
                          <button
                            onClick={() => handleUpdateStatus(message.id, "read")}
                            disabled={processingIds.has(message.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-750 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Mark Read
                          </button>
                        )}
                        
                        {message.status !== "replied" && (
                          <button
                            onClick={() => handleUpdateStatus(message.id, "replied")}
                            disabled={processingIds.has(message.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            Mark Replied
                          </button>
                        )}

                        {message.status !== "unread" && (
                          <button
                            onClick={() => handleUpdateStatus(message.id, "unread")}
                            disabled={processingIds.has(message.id)}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-750 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <Clock className="h-3.5 w-3.5" />
                            Mark Unread
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(message.id)}
                          disabled={processingIds.has(message.id)}
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
