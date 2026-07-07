"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface WebsiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  emails: string[];
  phones: string[];
  social_links: {
    instagram?: string;
    threads?: string;
    x?: string;
    facebook?: string;
  };
  address?: string;
  office_hours?: string;
  google_map_iframe?: string;
}

export default function SiteFooter() {
  const [settings, setSettings] = React.useState<WebsiteSettings | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest("/api/settings");
        if (res && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in Footer:", err);
      }
    };
    fetchSettings();
  }, []);
  return (
    <footer className="bg-zinc-900 text-zinc-300 font-sans" aria-label="Site Footer bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings?.logo_url || `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo.png`}
              alt={settings?.site_name || "Web Creation Nepal Private Limited"}
              width={240}
              height={60}
              className="h-[60px] w-auto object-contain"
            />
          </div>
          <p className="text-xs leading-relaxed text-zinc-400 mb-5">
            {settings?.site_tagline || "Empowering businesses with cutting-edge digital solutions — web design, development, SEO, and beyond."}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {(settings?.social_links?.facebook || !settings) && (
              <a
                href={settings?.social_links?.facebook || "https://www.facebook.com/webcreationnepal/"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#76a21e] hover:text-white transition-all shadow-sm cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            )}
            {(settings?.social_links?.instagram || !settings) && (
              <a
                href={settings?.social_links?.instagram || "https://www.instagram.com/webcreationnepal/"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#76a21e] hover:text-white transition-all shadow-sm cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
            )}
            {(settings?.social_links?.x || !settings) && (
              <a
                href={settings?.social_links?.x || "https://x.com/webcreationnp"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#76a21e] hover:text-white transition-all shadow-sm cursor-pointer"
                aria-label="X (formerly Twitter)"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {settings?.social_links?.threads && (
              <a
                href={settings.social_links.threads}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-[#76a21e] hover:text-white transition-all shadow-sm cursor-pointer"
                aria-label="Threads"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19.25 12C19.25 15.82 16.32 19 12 19c-4.42 0-7.25-3.09-7.25-7s2.83-7 7.25-7c3.48 0 5.6 2.1 6.07 4.92M15 11.25a2.75 2.75 0 1 1-5.5 0 2.75 2.75 0 0 1 5.5 0z" />
                  <path d="M14.25 11.25v2.25a2.5 2.5 0 0 1-5 0v-2.25" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white mb-4">Quick Links</h3>
          <ul className="space-y-2">
            {[
              { label: "Home",    href: "/" },
              { label: "Blogs",   href: "/blogs" },
              { label: "About",   href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-xs text-zinc-400 hover:text-white transition-colors font-medium">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white mb-4">Contact</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2 text-xs text-zinc-400">
              <Phone className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
              <span>{settings?.phones?.length ? settings.phones.join(" / ") : "977-01-5343968 / 9851029233"}</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-zinc-400">
              <Mail className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
              <span>{settings?.emails?.length ? settings.emails.join(" / ") : "contact@webcreation.com.np"}</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-zinc-400">
              <Clock className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
              <span>{settings?.office_hours || "Sunday – Friday: 09:00 – 18:00"}</span>
            </li>
            <li className="flex items-start gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5 text-orange-400 mt-0.5 shrink-0" />
              <span>{settings?.address || "Kathmandu, Nepal"}</span>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-white mb-4">Services</h3>
          <ul className="space-y-2">
            {["Web Design", "Web Development", "SEO Optimization", "Digital Marketing", "E-Commerce"].map((s) => (
              <li key={s}>
                <span className="text-xs text-zinc-400 font-medium">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-zinc-500 font-medium">
          <span>© {new Date().getFullYear()} {settings?.site_name || "Web Creation Nepal Pvt. Ltd."} All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
