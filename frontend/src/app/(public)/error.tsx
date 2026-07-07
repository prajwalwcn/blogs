"use client";

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    // Log the error to an analytics reporting service
    console.error("Public dynamic page load failure:", error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-950/20">
      <div className="flex flex-col items-center space-y-4 max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-full text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="text-center space-y-1.5">
          <h2 className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
            Failed to Load Channel
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            There was a connection issue loading this page. Please make sure the service is active and try again.
          </p>
        </div>

        {error.digest && (
          <div className="pt-2">
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-950 px-2.5 py-1 rounded border border-zinc-200/50 dark:border-zinc-800">
              ID: {error.digest}
            </span>
          </div>
        )}

        <div className="w-full pt-4">
          <Button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl shadow transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 animate-spin-hover" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
