"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRightCircle, ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({ categories }: CategoryListProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!categories || categories.length === 0) return null;

  const displayedCategories = expanded ? categories : categories.slice(0, 4);

  return (
    <div className="bg-[#f4f7fc] border border-zinc-200/70 rounded-2xl p-6 shadow-sm">
      <h3 className="text-[20px] font-bold text-zinc-900 tracking-tight mb-5 pb-3.5 border-b border-zinc-200/70 flex items-center justify-between">
        <span>Categories</span>
        <span className="text-[11px] font-bold text-zinc-400 bg-zinc-200/60 px-2 py-0.5 rounded-full">
          {categories.length}
        </span>
      </h3>
      <ul className="space-y-4">
        {displayedCategories.map((cat) => (
          <li key={cat.id}>
            <Link
              href="/"
              className="flex items-center gap-3 group text-[14px] font-semibold text-zinc-700 hover:text-[#2665A3] transition-colors"
            >
              <ArrowRightCircle className="h-5 w-5 text-[#5e8347] shrink-0 group-hover:scale-105 transition-transform" />
              <span>{cat.name}</span>
            </Link>
          </li>
        ))}
      </ul>

      {categories.length > 4 && (
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
              Show More ({categories.length - 4}) <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
