import type { Metadata } from "next";
import { Host_Grotesk, Roboto_Condensed } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

const robotoCondensed = Roboto_Condensed({
  weight: ["300", "400", "700"],
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
});

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = rawApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

async function getSettings() {
  try {
    const res = await fetch(`${API_URL}/api/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const favicon = settings?.favicon_url;
  
  let faviconUrl = "/favicon.ico";
  if (favicon) {
    faviconUrl = favicon.startsWith("http") ? favicon : `${API_URL}${favicon}`;
  }

  return {
    title: "Blogs Admin Console",
    description: "Secure, optimized administration area for blogs and technical posts management.",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${robotoCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
