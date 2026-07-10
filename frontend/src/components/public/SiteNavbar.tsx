"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Clock, Mail, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";



interface WebsiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  emails: string[];
  phones: string[];
  office_hours?: string;
  address?: string;
  social_links: {
    instagram?: string;
    threads?: string;
    x?: string;
    facebook?: string;
  };
}

const resolveLogoUrl = (url?: string | null) => {
  if (!url) return "/logo.png";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${API_URL}${cleanUrl}`;
};

export default function SiteNavbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled,   setScrolled]   = React.useState(false);
  const [phoneIconError, setPhoneIconError] = React.useState(false);
  const [timeIconError, setTimeIconError] = React.useState(false);
  const [emailIconError, setEmailIconError] = React.useState(false);
  const [settings, setSettings] = React.useState<WebsiteSettings | null>(null);
  interface NavItem {
    label: string;
    url: string;
    image_url?: string | null;
  }

  const [navItems, setNavItems] = React.useState<NavItem[]>([
    { label: "Home",     url: "/" },
    { label: "Blogs",    url: "/blogs" },
    { label: "About",    url: "/about" },
    { label: "Services", url: "/services" },
    { label: "Contact",  url: "/contact" },
  ]);

  const parsedHours = React.useMemo(() => {
    if (!settings?.office_hours) {
      return { days: "Sunday to Friday", hours: "09:00 AM – 06:00 PM" };
    }
    const idx = settings.office_hours.indexOf(":");
    if (idx !== -1) {
      const days = settings.office_hours.slice(0, idx).trim();
      const hours = settings.office_hours.slice(idx + 1).trim();
      return { days, hours };
    }
    return { days: "Office Hours", hours: settings.office_hours };
  }, [settings]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });

    const fetchSettings = async () => {
      try {
        const res = await apiRequest("/api/settings");
        if (res && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in Navbar:", err);
      }

      try {
        const menuRes = await apiRequest("/api/menus");
        if (menuRes && menuRes.data && menuRes.data.length > 0) {
          setNavItems(menuRes.data);
        }
      } catch {
        // Keep static fallback items on failure
      }
    };
    fetchSettings();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryPhone = settings?.phones?.length 
    ? settings.phones[0].replace(/[^0-9+]/g, "") 
    : "+9779851029233";

  const drawerSupportItems = React.useMemo(() => {
    const rawHours = settings?.office_hours || "Sunday – Friday: 09:00 AM – 06:00 PM";
    const cleanHours = rawHours
      .replace(/Satssssssurday/gi, "Saturday")
      .replace(/:\s*09:00\s*AM\s*-\s*PM/gi, ": 09:00 AM – 06:00 PM");

    const emailText = settings?.emails?.length ? settings.emails[0] : "contact@webcreation.com.np";
    const phoneText = settings?.phones?.length ? settings.phones.join(" / ") : "977-01-5343968 / 9851029233";

    return [
      { icon: Phone, text: phoneText, href: `tel:${primaryPhone}` },
      { icon: Mail,  text: emailText, href: `mailto:${emailText}` },
      { icon: Clock, text: cleanHours, href: null },
    ];
  }, [settings, primaryPhone]);

  React.useEffect(() => {
    if (settings?.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "shortcut icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings]);

  return (
    <header className="w-full sticky top-0 z-50 font-sans">

      {/* ── Top Info Bar (logo + contact chips + menu btn) ─────── */}
      <div
        className={cn(
          "bg-white border-b border-zinc-200 transition-shadow duration-300",
          scrolled && "shadow-sm"
        )}
      >
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
          <div className="flex items-center h-[85px] sm:h-[95px] md:h-[105px] lg:h-[110px] gap-4 lg:gap-6 xl:gap-8">

            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 flex items-center"
              aria-label={`${settings?.site_name || "Web Creation Nepal"} — Home`}
            >
              <img
                src={resolveLogoUrl(settings?.logo_url)}
                alt={settings?.site_name || "Web Creation Nepal Private Limited"}
                width={266}
                height={80}
                className="h-[70px] sm:h-[75px] md:h-[78px] lg:h-[80px] w-auto object-contain"
              />
            </Link>



            {/* Phone */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {!phoneIconError ? (
                <img
                  src="https://www.webcreationnepal.com/images/icons/phone.png"
                  alt="Phone"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain shrink-0"
                  onError={() => setPhoneIconError(true)}
                />
              ) : (
                <Phone className="h-6 w-6 text-orange-500 shrink-0" strokeWidth={1.8} />
              )}
              <div>
                <p className="text-[12px] font-semibold text-[#1f5b94] uppercase tracking-wide">
                  Phone Support
                </p>
                <a
                  href={`tel:${primaryPhone}`}
                  className="font-roboto-condensed-custom font-bold text-[15px] leading-[28px] text-[rgb(75,75,75)] hover:text-blue-600 transition-colors whitespace-nowrap block"
                >
                  {settings?.phones?.length ? settings.phones.join(" / ") : "977-01-5343968 / 9851029233"}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="hidden md:flex items-center gap-3">
              {!timeIconError ? (
                <img
                  src="https://www.webcreationnepal.com/images/icons/time.png"
                  alt="Time"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain shrink-0"
                  onError={() => setTimeIconError(true)}
                />
              ) : (
                <Clock className="h-6 w-6 text-orange-500 shrink-0" strokeWidth={1.8} />
              )}
              <div className="leading-tight">
                <p className="text-[12px] font-semibold text-[#1f5b94] uppercase tracking-wide">
                  {parsedHours.hours}
                </p>
                <p className="font-roboto-condensed-custom font-bold text-[15px] leading-[28px] text-[rgb(75,75,75)] whitespace-nowrap">
                  {parsedHours.days}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="hidden md:flex items-center gap-3">
              {!emailIconError ? (
                <img
                  src="https://www.webcreationnepal.com/images/icons/email.png"
                  alt="Email"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain shrink-0"
                  onError={() => setEmailIconError(true)}
                />
              ) : (
                <Mail className="h-6 w-6 text-orange-500 shrink-0" strokeWidth={1.8} />
              )}
              <div className="leading-tight">
                <p className="text-[12px] font-semibold text-[#1f5b94] uppercase tracking-wide">
                  Email Support
                </p>
                <a
                  href={`mailto:${settings?.emails?.length ? settings.emails[0] : "contact@webcreation.com.np"}`}
                  className="font-roboto-condensed-custom font-bold text-[15px] leading-[28px] text-[rgb(75,75,75)] hover:text-blue-600 transition-colors whitespace-nowrap block"
                >
                  {settings?.emails?.length ? settings.emails[0] : "contact@webcreation.com.np"}
                </a>
              </div>
            </div>

            {/* Get a Quote CTA Button (Desktop) */}
            <Link
              href="#contact-section"
              className="hidden lg:inline-flex items-center justify-center px-5 py-2.5 bg-[#b83d00] hover:bg-[#9c3300] text-white font-extrabold uppercase text-[11px] tracking-widest rounded-full transition-all duration-200 shrink-0 ml-3 shadow-sm hover:shadow"
            >
              Get a Quote
            </Link>

            {/* Menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={mobileOpen}
              className="h-11 w-11 flex items-center justify-center rounded-md bg-[#1a5276] hover:bg-[#154360] transition-colors text-white shrink-0 ml-auto md:ml-4 lg:ml-2"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

          </div>
        </div>
      </div>


      {/* ── Right Slide-over Drawer (Unified Mobile & Desktop) ────────────────── */}
      {/* Backdrop overlay - No blur, very subtle opacity */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/15 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Drawer panel - Minimal, clean shadow and zero unnecessary lines */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-[340px] bg-white shadow-xl flex flex-col justify-between transition-transform duration-300 ease-in-out border-l border-zinc-100",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Drawer Header - Sleek */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-50 shrink-0">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
              
            </span>
            <button
              onClick={() => setMobileOpen(false)}
              className="h-8 w-8 flex items-center justify-center hover:cursor-pointer rounded-full bg-red-50 hover:bg-red-100 transition-colors text-red-600 hover:text-red-700"
              aria-label="Close navigation menu"
            >
              <X className="h-4.5 w-4.5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Navigation Links List - Modern & Minimal */}
          <ul className="px-3 py-6 space-y-0.5 shrink-0" role="list">
            {navItems.map((link) => {
              const isInternal =
                link.url.startsWith("/blogs") ||
                link.url.startsWith("/tags") ||
                link.url.startsWith("/authors") ||
                link.url.startsWith("/admin") ||
                link.url === "/";

              const itemClass = "flex items-center gap-3 px-5 py-3 text-[17px] font-semibold text-zinc-700 hover:text-brand-orange hover:bg-zinc-50/60 rounded-lg transition-all duration-150 hover:translate-x-0.5";

              const content = (
                <>
                  {link.image_url && (
                    <img
                      src={link.image_url}
                      alt=""
                      className="h-7 w-7 object-contain shrink-0 opacity-95"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  <span>{link.label}</span>
                </>
              );

              return (
                <li key={link.url}>
                  {isInternal ? (
                    <Link href={link.url} onClick={() => setMobileOpen(false)} className={itemClass}>
                      {content}
                    </Link>
                  ) : (
                    <a href={link.url} className={itemClass}>
                      {content}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact info & CTA - Elegant & Clean (Contrasted box with high legibility) */}
        <div className="bg-[#f8fafc] border-t border-zinc-200/80 p-6 space-y-5 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.015)]">
          <Link
            href="#contact-section"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center py-2.5 bg-[#b83d00] hover:bg-[#9c3300] text-white font-extrabold uppercase text-[11px] tracking-widest rounded-full transition-all duration-200"
          >
            Get a Quote
          </Link>

          <div className="space-y-3 pt-2">
            <p className="text-[14px] font-bold text-zinc-500 uppercase tracking-widest">
              Contact Support
            </p>
            {drawerSupportItems.map(({ icon: Icon, text, href }) => {
              const content = (
                <>
                  <Icon className="h-4.5 w-4.5 text-[#1f5b94] shrink-0 mt-0.5" strokeWidth={1.8} />
                  <span>{text}</span>
                </>
              );

              return href ? (
                <a
                  key={text}
                  href={href}
                  className="flex items-start gap-2.5 text-[14px] text-zinc-700 hover:text-blue-600 font-semibold leading-relaxed transition-colors cursor-pointer"
                >
                  {content}
                </a>
              ) : (
                <div key={text} className="flex items-start gap-2.5 text-[14px] text-zinc-700 font-semibold leading-relaxed">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
