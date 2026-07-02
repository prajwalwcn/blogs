"use client";

import { useState } from "react";
import { Link, Check } from "lucide-react";
import { FacebookIcon, XIcon, InstagramIcon } from "./SocialIcons";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const getFacebookShareUrl = () => {
    if (typeof window === "undefined") return "#";
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  };

  const getTwitterShareUrl = () => {
    if (typeof window === "undefined") return "#";
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;
  };

  const getInstagramUrl = () => {
    // Instagram doesn't support sharing via URL intent; link to brand page
    return "https://www.instagram.com/webcreationnepal/";
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
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 w-7 rounded-full bg-[#1877f2]/10 border border-[#1877f2]/20 flex items-center justify-center text-[#1877f2] hover:bg-[#1877f2] hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Share on Facebook"
        >
          <FacebookIcon className="h-4 w-4" />
        </a>

        {/* X (formerly Twitter) Button */}
        <a
          href={getTwitterShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 w-7 rounded-full bg-zinc-900/10 border border-zinc-900/20 flex items-center justify-center text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Share on X"
        >
          <XIcon className="h-3.5 w-3.5" />
        </a>

        {/* Instagram Button */}
        <a
          href={getInstagramUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="h-7 w-7 rounded-full bg-[#e1306c]/10 border border-[#e1306c]/20 flex items-center justify-center text-[#e1306c] hover:bg-[#e1306c] hover:text-white transition-all duration-200 cursor-pointer shadow-sm"
          title="Follow us on Instagram"
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
