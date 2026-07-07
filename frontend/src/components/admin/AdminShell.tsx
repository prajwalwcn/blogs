"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Link2,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
  Users,
  Tags,
  Mail,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { apiRequest, removeAuthToken } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AdminShellProps {
  /** Which menu item is highlighted */
  activePage: "Dashboard" | "Manage Blogs" | "Manage Posts" | "Manage Authors" | "Manage Categories" | "SEO Redirects" | "Comments" | "Settings" | "Contact Messages" | "Manage Menus";
  /** Text shown in the sticky top header bar */
  headerTitle: string;
  /** Optional button / badge element rendered on the right of the header */
  headerRight?: React.ReactNode;
  /** Authenticated user passed from the page */
  user: { id: number; name: string; email: string } | null;
  children: React.ReactNode;
}

const menuItems = [
  { name: "Dashboard",         path: "/admin/dashboard",  icon: LayoutDashboard },
  { name: "Manage Blogs",      path: "/admin/blogs",       icon: Layers },
  { name: "Manage Authors",    path: "/admin/authors",     icon: Users },
  { name: "Manage Categories", path: "/admin/categories",  icon: Tags },
  { name: "Manage Menus",      path: "/admin/menus",       icon: Menu },
  { name: "SEO Redirects",     path: "/admin/redirects",  icon: Link2 },
  { name: "Comments",          path: "/admin/comments",   icon: MessageSquare },
  { name: "Contact Messages",  path: "/admin/contacts",   icon: Mail },
  { name: "Settings",          path: "/admin/settings",   icon: Settings },
] as const;

export default function AdminShell({
  activePage,
  headerTitle,
  headerRight,
  user,
  children,
}: AdminShellProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = `${headerTitle} | Blogs Admin Console`;
    }
  }, [headerTitle]);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest("/api/settings");
        if (res && res.data) {
          const url = res.data.logo_url;
          if (url) {
            if (url.startsWith("http://") || url.startsWith("https://")) {
              setLogoUrl(url);
            } else {
              const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
              const cleanUrl = url.startsWith("/") ? url : `/${url}`;
              setLogoUrl(`${API_URL}${cleanUrl}`);
            }
          }

          const fav = res.data.favicon_url;
          if (fav) {
            let resolvedFav = fav;
            if (!fav.startsWith("http://") && !fav.startsWith("https://")) {
              const rawApi = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
              const API = rawApi.replace(/\/api\/?$/, "").replace(/\/$/, "");
              resolvedFav = `${API}${fav.startsWith("/") ? fav : `/${fav}`}`;
            }
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.getElementsByTagName("head")[0].appendChild(link);
            }
            link.href = resolvedFav;
          }
        }
      } catch {
        // Fallback silently if settings fail to load
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest("/api/logout", { method: "POST" });
    } catch { /* ignore */ }
    removeAuthToken();
    toast.success("Successfully signed out!");
    router.push("/wcnadmin");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-zinc-900 dark:text-zinc-100 font-sans antialiased">

        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <Sidebar
          collapsible="icon"
          className="border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-955"
        >
          {/* Brand */}
          <SidebarHeader className="border-b border-zinc-100 dark:border-zinc-800/80 p-4 flex flex-col items-center justify-center gap-3.5">
            {/* Logo */}
            {logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-8 w-auto max-w-[160px] object-contain shrink-0 group-data-[collapsible=icon]:hidden"
                  onError={() => setLogoUrl(null)}
                />
                <div className="hidden group-data-[collapsible=icon]:flex h-8 w-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 items-center justify-center text-[#1a5276] dark:text-[#5dade2] font-black text-sm shrink-0 border border-zinc-200/60 dark:border-zinc-700/60 shadow-sm">
                  W
                </div>
              </>
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-orange/20 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
            )}

            {/* Title */}
            <div className="group-data-[collapsible=icon]:hidden text-center overflow-hidden">
              <h2 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight tracking-tight">
                Blogs <span className="text-brand-orange">Admin</span>
              </h2>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-widest block mt-0.5">
                Console Portal
              </span>
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="p-3">
            <SidebarGroup className="p-0">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-3 text-[10px] font-extrabold uppercase tracking-widest text-zinc-450 dark:text-zinc-550 mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.name === activePage;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => router.push(item.path)}
                          tooltip={item.name}
                          className={cn(
                            "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer overflow-hidden border border-transparent",
                            isActive
                              ? "bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange font-bold border-brand-orange/5"
                              : "text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white"
                          )}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-brand-orange" />
                          )}
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive ? "text-brand-orange" : "text-zinc-450 dark:text-zinc-500"
                            )}
                          />
                          <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* User footer */}
          <SidebarFooter className="border-t border-zinc-100 dark:border-zinc-800/80 p-4 bg-zinc-50/20 dark:bg-zinc-900/5">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-150 dark:border-zinc-800/80 mb-3 group-data-[collapsible=icon]:hidden overflow-hidden">
              <div className="h-9 w-9 rounded-lg bg-brand-orange flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-medium text-zinc-450 dark:text-zinc-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full h-9 flex items-center justify-center gap-2 border-zinc-200 dark:border-zinc-800 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-955/20 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-600 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        {/* ── Main area ──────────────────────────────────────────────── */}
        <SidebarInset className="flex-1 flex flex-col min-h-screen bg-background">
          {/* Sticky header */}
          <header className="h-16 shrink-0 border-b border-border bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10 flex items-center px-6 justify-between gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-brand-orange hover:text-brand-orange-hover" />
              <span className="h-4 w-px bg-zinc-250 dark:bg-zinc-800" />
              <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{headerTitle}</span>
            </div>
            {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
          </header>

          {/* Page body — full width, scrollable */}
          <main className="flex-1 w-full">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
