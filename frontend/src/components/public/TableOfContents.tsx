"use client";

import * as React from "react";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

interface Section {
  title: string;
  content: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!sections || sections.length === 0) return null;

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const displayedSections = expanded ? sections : sections.slice(0, 4);

  return (
    <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
      <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70 flex items-center justify-between">
        <span>Table of Content</span>
        <span className="text-[11px] font-bold text-zinc-400 bg-zinc-200/60 px-2 py-0.5 rounded-full">
          {sections.length}
        </span>
      </h3>
      <ul className="space-y-4">
        {displayedSections.map((sec, idx) => {
          const secId = slugify(sec.title);
          return (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#e3ecda]/70 text-[#5e8347] flex items-center justify-center shrink-0 mt-0.5 border border-[#e3ecda] shadow-sm">
                <ChevronRight className="h-3 w-3" strokeWidth={3} />
              </span>
              <a
                href={`#${secId}`}
                className="text-[14px] leading-snug hover:text-[#2665A3] transition-colors font-semibold text-zinc-700"
              >
                {sec.title}
              </a>
            </li>
          );
        })}
      </ul>

      {sections.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-5 pt-3.5 border-t border-zinc-200/50 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider"
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show More ({sections.length - 4}) <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
