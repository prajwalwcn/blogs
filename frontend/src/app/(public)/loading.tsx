"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-950/20">
      <div className="flex flex-col items-center space-y-4 max-w-md w-full">
        {/* Pulsing loading icon */}
        <div className="p-3 bg-white dark:bg-zinc-900 rounded-full shadow-md border border-zinc-100 dark:border-zinc-800 animate-bounce">
          <Loader2 className="h-7 w-7 text-brand-orange animate-spin" />
        </div>

        {/* Text cues */}
        <div className="text-center space-y-1.5 animate-pulse">
          <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
            Loading Content
          </h2>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            Optimizing rendering view...
          </p>
        </div>

        {/* Pulsing card skeletons */}
        <div className="w-full space-y-3 pt-6">
          <div className="h-10 bg-zinc-200/60 dark:bg-zinc-800/50 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-4 bg-zinc-200/50 dark:bg-zinc-800/40 rounded animate-pulse w-5/6 mx-auto" />
          <div className="h-4 bg-zinc-200/50 dark:bg-zinc-800/40 rounded animate-pulse w-2/3 mx-auto" />
        </div>
      </div>
    </div>
  );
}
