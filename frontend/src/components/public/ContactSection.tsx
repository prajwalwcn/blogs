"use client";

import * as React from "react";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface WebsiteSettings {
  site_name: string;
  site_tagline: string;
  logo_url: string;
  favicon_url: string;
  emails: string[];
  phones: string[];
  address: string;
  office_hours: string;
  google_map_iframe: string;
  social_links?: {
    instagram?: string;
    threads?: string;
    x?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export default function ContactSection() {
  const [settings, setSettings] = React.useState<WebsiteSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = React.useState(true);

  // Form states
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await apiRequest("/api/settings");
        if (res && res.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error("Failed to load settings in ContactSection", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest("/api/contacts", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          subject: subject || "General Contact Inquiry",
          message,
        }),
      });

      toast.success("Thank you! Your message has been sent successfully.");
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const dynamicPhone = settings?.phones?.[0] || "+977 9851029233";
  const dynamicEmail = settings?.emails?.[0] || "contact@webcreation.com.np";
  const dynamicAddress = settings?.address || "Kathmandu, Nepal";

  return (
    <div id="contact-section" className="w-full bg-[#2665A3] text-white border-t border-blue-700/30 pt-16">
      
      {/* Width constrained to align exactly with header & footer padding */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-12">
        
        {/* Contact Layout Grid (2 Columns: Info & Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Contact Information Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div>
                <span className="block text-[11px] font-bold text-zinc-50 uppercase tracking-widest mb-1.5">
                  CONTACT US
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  Feel Free To Contact & Get In Touch !
                </h3>
              </div>
              
              <p className="text-xs text-white/85 leading-relaxed max-w-sm">
                Omnis quis sunt quasi aliquet senectus tenetur dolor! Omnis! Corrupti, est arcu, felis, molestiae impedit vel felis eget.
              </p>

              {/* Pill-shaped Information Items */}
              <div className="space-y-4 pt-4">
                {/* Email Address Pill */}
                <div className="flex items-center gap-4 bg-white/5  border-white/10 rounded-half px-6 py-3.5 hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-zinc-50 uppercase tracking-wider">Email Address :</span>
                    <a href={`mailto:${dynamicEmail}`} className="text-xs sm:text-sm font-semibold text-white hover:underline transition-all block truncate">
                      {dynamicEmail}
                    </a>
                  </div>
                </div>

                {/* Phone Number Pill */}
                <div className="flex items-center gap-4 bg-white/5  border-white/10 rounded-half px-6 py-3.5 hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-zinc-50 uppercase tracking-wider">Phone Number :</span>
                    <a href={`tel:${dynamicPhone}`} className="text-xs sm:text-sm font-semibold text-white hover:underline transition-all block truncate">
                      {dynamicPhone}
                    </a>
                  </div>
                </div>

                {/* Location Address Pill */}
                <div className="flex items-center gap-4 bg-white/5  border-white/10 rounded-half px-6 py-3.5 hover:bg-white/10 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 shadow-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-zinc-50 uppercase tracking-wider">Location Address :</span>
                    <span className="text-xs sm:text-sm font-semibold text-white block truncate">
                      {dynamicAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form (60%) */}
          <div className="lg:col-span-7 flex flex-col justify-between lg:pl-10 lg:border-l border-white/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Your Name & Your Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name.."
                  className="w-full h-11 px-5 rounded-half  border-white/20 bg-white/10 text-white placeholder:text-white/60 text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/15 transition-all font-medium"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email.."
                  className="w-full h-11 px-5 rounded-half   border-white/20 bg-white/10 text-white placeholder:text-white/60 text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/15 transition-all font-medium"
                />
              </div>

              {/* Row 2: Your Subject & Your Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your Subject.."
                  className="w-full h-11 px-5 rounded-half  border-white/20 bg-white/10 text-white placeholder:text-white/60 text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/15 transition-all font-medium"
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your Number.."
                  className="w-full h-11 px-5 rounded-half  border-white/20 bg-white/10 text-white placeholder:text-white/60 text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/15 transition-all font-medium"
                />
              </div>

              {/* Row 3: Message Textarea */}
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter Your Message.."
                className="w-full px-5 py-4 rounded-2xl  border-white/20 bg-white/10 text-white placeholder:text-white/60 text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/15 transition-all resize-none font-medium"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="px-8 h-11 rounded-half bg-white hover:bg-zinc-100 text-[#2665A3] font-bold uppercase text-[11px]  flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>SUBMIT MESSAGE</span>
                )}
              </button>
            </form>

            {/* Social Links Section */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <span className="block text-[11px] font-bold text-white/80 uppercase tracking-wider mb-3">
                Follow us on social media :
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={settings?.social_links?.facebook || "https://www.facebook.com/webcreationnepal/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-[#3b5998] hover:scale-105 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1h-3c-3 0-5 2-5 5v2z" />
                  </svg>
                </a>
                <a
                  href={settings?.social_links?.x || "https://x.com/webcreationnp"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-[#1da1f2] hover:scale-105 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={settings?.social_links?.instagram || "https://www.instagram.com/webcreationnepal/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-[#c13584] hover:scale-105 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href={settings?.social_links?.linkedin || "https://www.linkedin.com/company/webcreationnepal/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-full bg-[#0077b5] hover:scale-105 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Nested Google Map (inside the contact section container) ── */}
        <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-lg relative h-[380px] bg-white/5 [&_iframe]:w-full [&_iframe]:h-full">
          {settings?.google_map_iframe ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: settings.google_map_iframe.includes("title=") 
                  ? settings.google_map_iframe 
                  : settings.google_map_iframe.replace(/<iframe/i, '<iframe title="Google Maps Location of Web Creation Nepal"')
              }} 
              className="w-full h-full" 
            />
          ) : (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.2285994246944!2d85.32185257620353!3d27.702553976189917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19a63b2f9011%3A0x446e1074a36f56bc!2sWeb%20Creation%20Nepal!5e0!3m2!1sen!2snp!4v1719811200000!5m2!1sen!2snp"
              title="Google Maps Location of Web Creation Nepal"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
            />
          )}
        </div>

      </div>

      {/* ── Copyright Footer Bar ── */}
      <div className="w-full bg-[#eaeaea] py-6 mt-16 text-[#555] text-xs sm:text-sm border-t border-zinc-200">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 flex justify-center items-center text-center">
          <p className="font-sans font-medium">
            Copyright &copy; 2024 Web Creation Nepal. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
