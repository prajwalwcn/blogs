"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Clock, Mail, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

const navLinks = [
  { label: "Home",     href: "/" },
  { label: "Blogs",    href: "/blogs" },
  { label: "About",    href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact",  href: "/contact" },
];

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

export default function SiteNavbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled,   setScrolled]   = React.useState(false);
  const [phoneIconError, setPhoneIconError] = React.useState(false);
  const [timeIconError, setTimeIconError] = React.useState(false);
  const [emailIconError, setEmailIconError] = React.useState(false);
  const [settings, setSettings] = React.useState<WebsiteSettings | null>(null);

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
    };
    fetchSettings();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <div className="flex items-center h-[107px] gap-4 lg:gap-6 xl:gap-8">

            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 flex items-center"
              aria-label={`${settings?.site_name || "Web Creation Nepal"} — Home`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings?.logo_url || "/logo.png"}
                alt={settings?.site_name || "Web Creation Nepal Private Limited"}
                className="h-[80px] w-auto object-contain"
              />
            </Link>

            {/* Phone */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              {!phoneIconError ? (
                <img
                  src="https://www.webcreationnepal.com/images/icons/phone.png"
                  alt="Phone"
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
                <p className="font-roboto-condensed-custom font-bold text-[15px] leading-[28px] text-[rgb(75,75,75)] whitespace-nowrap">
                  {settings?.phones?.length ? settings.phones.join(" / ") : "977-01-5343968 / 9851029233"}
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="hidden md:flex items-center gap-3">
              {!timeIconError ? (
                <img
                  src="https://www.webcreationnepal.com/images/icons/time.png"
                  alt="Time"
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
                <p className="font-roboto-condensed-custom font-bold text-[15px] leading-[28px] text-[rgb(75,75,75)] whitespace-nowrap">
                  {settings?.emails?.length ? settings.emails[0] : "contact@webcreation.com.np"}
                </p>
              </div>
            </div>

            {/* Menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={mobileOpen}
              className="h-11 w-11 flex items-center justify-center rounded-md bg-[#1a5276] hover:bg-[#154360] transition-colors text-white shrink-0 ml-4 md:ml-6 lg:ml-8"
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


      {/* ── Mobile Drawer ──────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 shadow-lg">
          <ul className="px-4 py-3 space-y-0.5" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-semibold text-zinc-700 hover:text-[#1a5276] hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile contact info */}
          <div className="px-6 py-4 border-t border-zinc-100 space-y-3">
            {[
              { icon: Phone, text: settings?.phones?.length ? settings.phones.join(" / ") : "977-01-5343968 / 9851029233" },
              { icon: Mail,  text: settings?.emails?.length ? settings.emails[0] : "contact@webcreation.com.np" },
              { icon: Clock, text: settings?.office_hours || "Sunday – Friday: 09:00 – 18:00" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs text-zinc-600 font-medium">
                <Icon className="h-3.5 w-3.5 text-orange-500 shrink-0" strokeWidth={2.2} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
