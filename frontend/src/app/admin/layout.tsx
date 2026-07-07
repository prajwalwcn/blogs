import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Blogs Admin Console",
    default: "Blogs Admin Console",
  },
  description: "Secure, optimized administration area for blogs and technical posts management.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
