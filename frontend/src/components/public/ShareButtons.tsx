"use client";

import { useState } from "react";
import { Link, Check } from "lucide-react";
import { FacebookIcon, XIcon, InstagramIcon, WhatsappIcon } from "./SocialIcons";

interface ShareButtonsProps {
  title: string;
  description?: string;
  url?: string;
}

export default function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getTargetUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "https://webcreation.com.np";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getTargetUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const getFacebookShareUrl = () => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getTargetUrl())}`;
  };

  const getTwitterShareUrl = () => {
    const text = description ? `${title} — ${description}` : title;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getTargetUrl())}`;
  };

  const getWhatsappShareUrl = () => {
    const text = description 
      ? `${title}\n\n${description}\n\n${getTargetUrl()}` 
      : `${title}: ${getTargetUrl()}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  const getInstagramUrl = () => {
    return "https://www.instagram.com/webcreationnepal/";
  };

  const openPopup = (url: string) => {
    if (typeof window === "undefined") return;
    const width = 600;
    const height = 400;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      "share_window",
      `width=${width},height=${height},left=${left},top=${top},location=no,toolbar=no,menubar=no`
    );
  };

  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <span className="text-[12px] font-extrabold uppercase tracking-wider text-zinc-400">
        Share:
      </span>
      <div className="flex items-center gap-2">
        {/* Facebook Button */}
        <a
          href={getFacebookShareUrl()}
          onClick={(e) => {
            e.preventDefault();
            openPopup(getFacebookShareUrl());
          }}
          className="h-7 w-7 rounded-full bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Share on Facebook"
        >
          <FacebookIcon className="h-4 w-4" />
        </a>

        {/* X (formerly Twitter) Button */}
        <a
          href={getTwitterShareUrl()}
          onClick={(e) => {
            e.preventDefault();
            openPopup(getTwitterShareUrl());
          }}
          className="h-7 w-7 rounded-full bg-zinc-900/10 border border-zinc-900/20 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Share on X"
        >
          <XIcon className="h-3.5 w-3.5" />
        </a>

        {/* WhatsApp Button */}
        <a
          href={getWhatsappShareUrl()}
          onClick={(e) => {
            e.preventDefault();
            openPopup(getWhatsappShareUrl());
          }}
          className="h-7 w-7 rounded-full bg-[#25d366]/10 border border-[#25d366]/20 flex items-center justify-center text-[#25d366] hover:bg-[#25d366] hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Share on WhatsApp"
        >
          <WhatsappIcon className="h-4 w-4" />
        </a>

        {/* Instagram Button */}
        <a
          href={getInstagramUrl()}
          onClick={async () => {
            // Instagram doesn't support direct web links sharing.
            // Auto copy link to clipboard to make it extremely easy to paste!
            try {
              await navigator.clipboard.writeText(getTargetUrl());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {}
          }}
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 w-7 rounded-full bg-[#e1306c]/10 border border-[#e1306c]/20 flex items-center justify-center text-[#e1306c] hover:bg-[#e1306c] hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Copy link & follow us on Instagram"
        >
          <InstagramIcon className="h-4 w-4" />
        </a>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="h-7 w-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Copy post link"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Link className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
