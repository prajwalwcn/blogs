"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Sparkles,
  Plus,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AdminShell from "@/components/admin/AdminShell";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();

  const [blogsCount, setBlogsCount] = React.useState(0);
  const [postsCount, setPostsCount] = React.useState(0);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    if (!loading && user) {
      Promise.all([
        apiRequest("/api/blogs"),
        apiRequest("/api/posts"),
      ])
        .then(([blogs, posts]) => {
          setBlogsCount(blogs.data?.length ?? 0);
          setPostsCount(posts.meta?.total ?? posts.data?.length ?? 0);
        })
        .catch(() => toast.error("Failed to load dashboard data."))
        .finally(() => setDataLoading(false));
    }
  }, [loading, user]);

  if (loading || dataLoading) return <AdminPageLoader message="Authorizing administration credentials..." />;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  return (
    <AdminShell
      activePage="Dashboard"
      headerTitle="Dashboard Overview"
      user={user}
      headerRight={
        <span className="px-2.5 py-1 rounded-full bg-brand-orange/10 dark:bg-brand-orange/20 text-[10px] font-extrabold text-brand-orange uppercase tracking-wider">
          V12 API Active
        </span>
      }
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

        {/* Welcome Banner */}
        <div className="bg-zinc-900 dark:bg-zinc-950/80 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden border border-zinc-800/50">
          <div className="absolute top-[-50%] right-[-10%] w-[320px] h-[320px] rounded-full bg-brand-orange/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-30%] left-[-5%] w-[200px] h-[200px] rounded-full bg-amber-400/10 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-brand-orange font-bold text-xs mb-2 uppercase tracking-widest">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Console Operations Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Welcome back, {user?.name?.split(" ")[0] ?? "Admin"}.
            </h1>
            <p className="text-zinc-400 max-w-2xl mt-2 text-sm leading-relaxed font-medium">
              Manage SEO, AEO, and GEO content structures. Verify indexing status, control canonical redirects, dynamic schemas, and post taxonomies directly from this dashboard.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { label: "Active Blogs",   value: blogsCount, icon: Layers,     sub: "Multi-blog routing enabled",   accent: "text-brand-orange" },
            { label: "Total Posts",    value: postsCount, icon: BookOpen,   sub: "Optimized for Google & LLMs",  accent: "text-brand-orange" },
            { label: "Comment Gates",  value: "Active",   icon: ShieldCheck, sub: "Approval gates operational",   accent: "text-emerald-500" },
          ].map(({ label, value, icon: Icon, sub, accent }) => (
            <Card key={label} className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  {label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${accent}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-black ${accent === "text-emerald-500" ? "text-emerald-500" : "text-zinc-900 dark:text-white"}`}>
                  {value}
                </div>
                <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 font-semibold">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-brand-orange" />
              Operations Center
            </CardTitle>
            <CardDescription className="font-semibold text-zinc-550 dark:text-zinc-400">
              Quick actions to write content and update configurations.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Create New Post",
                desc: "Write an SEO-optimized post",
                icon: Plus,
                action: () => router.push("/admin/posts/create"),
                variant: "orange" as const,
              },
              {
                title: "Manage Blogs",
                desc: "View and configure blog channels",
                icon: Layers,
                action: () => router.push("/admin/blogs"),
                variant: "outline" as const,
              },
              {
                title: "Review Comments",
                desc: "Moderate pending submissions",
                icon: MessageSquare,
                action: () => router.push("/admin/comments"),
                variant: "outline" as const,
              },
            ].map(({ title, desc, icon: Icon, action, variant }) => (
              <div
                key={title}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:shadow-md hover:border-brand-orange/20 transition-all duration-200 cursor-pointer group"
                onClick={action}
              >
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-brand-orange transition-colors">{title}</h4>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550 mt-0.5 font-medium">{desc}</p>
                </div>
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ml-3 ${variant === "orange" ? "bg-brand-orange text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-brand-orange/10 group-hover:text-brand-orange"} transition-colors`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            ))}

            {/* API Docs tile */}
            <div
              className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group col-span-1"
              onClick={() => window.open(`${apiUrl}/docs/api`, "_blank")}
            >
              <div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-white">API Docs</h4>
                <p className="text-xs text-zinc-450 dark:text-zinc-550 mt-0.5 font-medium">Test endpoints &amp; schemas</p>
              </div>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ml-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                <ExternalLink className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
