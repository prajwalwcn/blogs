import * as React from "react";

interface AdminPageLoaderProps {
  message?: string;
}

export default function AdminPageLoader({ message = "Loading..." }: AdminPageLoaderProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mb-4" />
      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold">{message}</p>
    </div>
  );
}
