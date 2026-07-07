"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  currentCategory: string;
}

export default function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showNavBtns, setShowNavBtns] = React.useState(false);
  const [isAtStart, setIsAtStart] = React.useState(true);
  const [isAtEnd, setIsAtEnd] = React.useState(false);

  const checkScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth;
      setShowNavBtns(hasOverflow);
      
      setIsAtStart(el.scrollLeft <= 5);
      setIsAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
    }
  }, []);

  React.useEffect(() => {
    // Initial check
    checkScrollState();

    // Check on window resize
    window.addEventListener("resize", checkScrollState);
    
    // Check on scroll
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScrollState);
    }

    return () => {
      window.removeEventListener("resize", checkScrollState);
      if (el) {
        el.removeEventListener("scroll", checkScrollState);
      }
    };
  }, [categories, checkScrollState]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full mb-8 border-b border-zinc-200/60 pb-5">
      <div className="flex items-center justify-between gap-4">
        {/* Horizontal Scroll Track */}
        <div
          ref={scrollRef}
          className="flex-1 flex flex-nowrap items-center gap-2.5 overflow-x-auto scroll-smooth select-none py-1"
          style={{
            msOverflowStyle: "none", /* IE and Edge */
            scrollbarWidth: "none", /* Firefox */
          }}
        >
          {/* Hide webkit scrollbar via local style tag */}
          <style dangerouslySetInnerHTML={{ __html: `
            div::-webkit-scrollbar {
              display: none !important;
            }
          `}} />

          {/* All Categories Link */}
          <Link
            href="/"
            className={`px-4 py-2 text-[12px] font-semibold rounded-full transition-all duration-200 shrink-0 ${
              !currentCategory
                ? "bg-[#507212] text-white shadow-sm"
                : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            All Categories
          </Link>

          {/* Individual Category Links */}
          {categories.map((cat) => {
            const isActive = currentCategory === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className={`px-4 py-2 text-[12px] font-semibold rounded-full transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-[#507212] text-white shadow-sm"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Dedicated Left and Right navigation buttons next to it (non-overlapping) */}
        {showNavBtns && (
          <div className="hidden md:flex items-center gap-1.5 shrink-0 pl-3 border-l border-zinc-200/60">
            <button
              onClick={handleScrollLeft}
              disabled={isAtStart}
              aria-label="Scroll left"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:text-[#76a21e] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleScrollRight}
              disabled={isAtEnd}
              aria-label="Scroll right"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:text-[#76a21e] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
