import type { Metadata } from "next";
import SiteNavbar from "@/components/public/SiteNavbar";
import FloatingContact from "@/components/public/FloatingContact";
import dynamic from "next/dynamic";

const ContactSection = dynamic(() => import("@/components/public/ContactSection"), {
  ssr: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    template: "%s | Web Creation Nepal Blog",
    default: "Web Creation Nepal – Digital Insights & Tech Articles",
  },
  description:
    "Explore expert articles on web design, development, SEO, digital marketing and technology from Web Creation Nepal — your trusted digital partner.",
  keywords: ["web design Nepal", "web development Kathmandu", "SEO Nepal", "digital marketing", "tech articles"],
  authors: [{ name: "Web Creation Nepal", url: "https://webcreation.com.np" }],
  creator: "Web Creation Nepal Pvt. Ltd.",
  publisher: "Web Creation Nepal Pvt. Ltd.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Web Creation Nepal Blog",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-placeholder",
    yandex: "yandex-verification-placeholder",
    other: {
      bing: "bing-verification-placeholder",
      baidu: "baidu-site-verification-placeholder",
    },
  },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <main id="main-content" className="flex-1 min-h-0">{children}</main>
      {/* <SiteFooter /> */}
      <ContactSection />
      <FloatingContact />
    </>
  );
}
