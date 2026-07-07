"use client";

import * as React from "react";
import { ChevronRight, ChevronDown, ChevronUp, List, X } from "lucide-react";

interface Section {
  title: string;
  content: string;
}

interface TableOfContentsProps {
  sections: Section[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false); // Mobile drawer toggle state

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
    <>
      {/* ── Desktop Static Table of Content Widget ──────────────── */}
      <div className="hidden lg:block bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
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
            className="w-full mt-5 pt-3.5 border-t border-zinc-200/50 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider cursor-pointer"
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

      {/* ── Mobile Floating Drawer Table of Content Widget ──────── */}
      <div className="lg:hidden">
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-2 top-[35%] -translate-y-1/2 z-40 h-10 w-10 flex items-center justify-center border border-cyan-100/80 rounded-lg bg-[#ebf5f7]/95 backdrop-blur-sm text-[#1a5c7a] hover:bg-[#d8ecef] hover:text-[#134962] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] cursor-pointer"
          aria-label="Open Table of Contents"
        >
          <List className="h-5 w-5" strokeWidth={2.2} />
        </button>

        {/* Backdrop overlay */}
        {isOpen && (
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 animate-in fade-in duration-200"
          />
        )}

        {/* Drawer Panel */}
        <div
          className={`fixed left-0 top-[72px] h-[calc(100vh-72px)] w-[80%] max-w-[280px] bg-[#fbf9f4] border-r border-zinc-250/70 shadow-2xl z-55 flex flex-col transition-transform duration-300 ease-in-out transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Floating Close Button outside drawer */}
          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-5 left-[calc(100%+16px)] h-10 w-10 flex items-center justify-center border border-zinc-200/80 rounded-lg bg-white text-zinc-500 hover:bg-zinc-55 hover:text-zinc-700 transition-colors shadow-sm cursor-pointer z-55"
              aria-label="Close Table of Contents"
            >
              <X className="h-5 w-5 text-[#1a5c7a]" strokeWidth={2.5} />
            </button>
          )}

          {/* Drawer Header - Warm eggshell card style */}
          <div className="px-6 pt-7 pb-4 shrink-0">
            <span className="text-[20px] font-extrabold text-zinc-800 tracking-tight block">
              Table of Contents
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ol className="space-y-5 list-decimal pl-4">
              {sections.map((sec, idx) => {
                const secId = slugify(sec.title);
                return (
                  <li key={idx} className="text-[14px] leading-snug font-semibold text-zinc-700 hover:text-[#2665A3] transition-colors pl-1.5">
                    <a
                      href={`#${secId}`}
                      onClick={() => setIsOpen(false)}
                      className="hover:underline"
                    >
                      {sec.title}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}
