"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Link2, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  Mail,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { removeAuthToken } from "@/lib/api";

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function AdminSidebar({ 
  userName = "Admin User", 
  userEmail = "admin@example.com" 
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Blogs", path: "/admin/blogs", icon: Layers },
    { name: "Manage Posts", path: "/admin/posts", icon: BookOpen },
    { name: "SEO Redirects", path: "/admin/redirects", icon: Link2 },
    { name: "Comments", path: "/admin/comments", icon: MessageSquare },
    { name: "Contact Messages", path: "/admin/contacts", icon: Mail },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    removeAuthToken();
    router.push("/wcnadmin");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg text-brand-orange hover:text-brand-orange-hover transition-all hover:scale-105"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-[280px] border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-transform duration-300 ease-in-out font-sans",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Top Header Section */}
        <div>
          {/* Logo Section - Enhanced */}
          <div className="h-20 border-b border-zinc-150 dark:border-zinc-800/80 flex items-center px-6 gap-3.5">
            <div className="relative h-11 w-11 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange-hover flex items-center justify-center text-white shadow-lg shadow-brand-orange/20">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.75} />
              <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-brand-green/90 border-2 border-white dark:border-zinc-950" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-bold text-base text-zinc-900 dark:text-white leading-none tracking-tight">
                Blog<span className="text-brand-orange">Admin</span>
              </h2>
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-1">
                Control Panel
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(item.path);
                  }}
                  className={cn(
                    "group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer relative",
                    isActive
                      ? "bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive 
                      ? "text-brand-orange" 
                      : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
                  )} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-brand-orange" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile and logout section at bottom */}
        <div className="p-4 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="flex items-center gap-3.5 mb-4 px-1.5">
            <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-green/20">
              {userName.charAt(0).toUpperCase()}
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-400 border-2 border-white dark:border-zinc-950" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-[11px] text-zinc-450 dark:text-zinc-500 truncate">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200 cursor-pointer group"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}