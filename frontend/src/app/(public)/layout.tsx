import type { Metadata } from "next";
import SiteNavbar from "@/components/public/SiteNavbar";
import FloatingContact from "@/components/public/FloatingContact";
import ContactSection from "@/components/public/ContactSection";

export const metadata: Metadata = {
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
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNavbar />
      <div className="flex-1 min-h-0">{children}</div>
      {/* <SiteFooter /> */}
      <ContactSection />
      <FloatingContact />
    </>
  );
}
