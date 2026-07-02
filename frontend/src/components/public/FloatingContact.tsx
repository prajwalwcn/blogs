"use client";

import * as React from "react";
import { Phone, Mail } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface WebsiteSettings {
  emails?: string[];
  phones?: string[];
}

export default function FloatingContact() {
  const [settings, setSettings] = React.useState<WebsiteSettings | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest("/api/settings");
        if (res && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in FloatingContact:", err);
      }
    };
    fetchSettings();
  }, []);

  const phone = settings?.phones?.[0] || "9851029233";
  const email = settings?.emails?.[0] || "contact@webcreation.com.np";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5 duration-500">
      {/* Call Button */}
      {phone && (
        <a
          href={`tel:${phone}`}
          className="group relative flex items-center justify-center h-12 w-12 rounded-full bg-[#76a21e] text-white shadow-lg hover:bg-[#648b17] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label={`Call ${phone}`}
        >
          <Phone className="h-5 w-5" />
          {/* Tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
            Call: {phone}
          </span>
        </a>
      )}

      {/* Email Button */}
      {email && (
        <a
          href={`mailto:${email}`}
          className="group relative flex items-center justify-center h-12 w-12 rounded-full bg-[#1a5276] text-white shadow-lg hover:bg-[#154260] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
          aria-label={`Email ${email}`}
        >
          <Mail className="h-5 w-5" />
          {/* Tooltip */}
          <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 origin-right bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none">
            Email: {email}
          </span>
        </a>
      )}
    </div>
  );
}
