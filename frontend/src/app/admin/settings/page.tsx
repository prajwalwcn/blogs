"use client";

import * as React from "react";
import {
  User,
  KeyRound,
  Globe,
  Save,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Trash2,
  Link2,
  MessageCircle,
  Phone,
  Mail,
  ImageIcon,
  Settings2,
  Upload,
  MapPin,
  Clock,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminShell from "@/components/admin/AdminShell";
import AdminPageLoader from "@/components/admin/AdminPageLoader";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SettingsTab = "profile" | "password" | "website";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile",  label: "Profile",          icon: User },
  { id: "password", label: "Password",         icon: KeyRound },
  { id: "website",  label: "Website Settings", icon: Globe },
];

interface SocialLinks {
  instagram: string;
  threads: string;
  x: string;
  facebook: string;
}

export default function AdminSettingsPage() {
  const { user, loading } = useAdminAuth();

  const [activeTab, setActiveTab] = React.useState<SettingsTab>("profile");

  /* ── Profile Tab ─────────────────────────────────── */
  const [profileName,  setProfileName]  = React.useState("");
  const [profileEmail, setProfileEmail] = React.useState("");
  const [savingProfile, setSavingProfile] = React.useState(false);

  /* ── Password Tab ────────────────────────────────── */
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword]         = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPw, setShowCurrentPw]     = React.useState(false);
  const [showNewPw, setShowNewPw]             = React.useState(false);
  const [savingPassword, setSavingPassword]   = React.useState(false);

  /* ── Website Settings Tab ────────────────────────── */
  const [settingsLoading, setSettingsLoading] = React.useState(false);
  const [savingSettings, setSavingSettings]   = React.useState(false);
  const [siteName, setSiteName]           = React.useState("");
  const [siteTagline, setSiteTagline]     = React.useState("");
  const [metaTitle, setMetaTitle]         = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [metaKeywords, setMetaKeywords]   = React.useState("");
  const [logoUrl, setLogoUrl]             = React.useState("");
  const [faviconUrl, setFaviconUrl]       = React.useState("");
  const [emails, setEmails]               = React.useState<string[]>([""]);
  const [phones, setPhones]               = React.useState<string[]>([""]);
  const [socialLinks, setSocialLinks]     = React.useState<SocialLinks>({
    instagram: "",
    threads: "",
    x: "",
    facebook: "",
  });
  const [address, setAddress]             = React.useState("");
  const [officeHours, setOfficeHours]     = React.useState("");
  const [googleMapIframe, setGoogleMapIframe] = React.useState("");

  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingFavicon, setUploadingFavicon] = React.useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const faviconInputRef = React.useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("image", files[0]);
    try {
      const res = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });
      setLogoUrl(res.url);
      toast.success("Logo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingFavicon(true);
    const formData = new FormData();
    formData.append("image", files[0]);
    try {
      const res = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });
      setFaviconUrl(res.url);
      toast.success("Favicon uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload favicon.");
    } finally {
      setUploadingFavicon(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      setProfileName(user.name ?? "");
      setProfileEmail(user.email ?? "");
    }
  }, [user]);

  // Load website settings when tab becomes active
  React.useEffect(() => {
    if (activeTab !== "website") return;
    const load = async () => {
      setSettingsLoading(true);
      try {
        const res = await apiRequest("/api/settings");
        const s = res.data;
        setSiteName(s.site_name ?? "");
        setSiteTagline(s.site_tagline ?? "");
        setMetaTitle(s.meta_title ?? "");
        setMetaDescription(s.meta_description ?? "");
        setMetaKeywords(s.meta_keywords ?? "");
        setLogoUrl(s.logo_url ?? "");
        setFaviconUrl(s.favicon_url ?? "");
        setEmails(s.emails?.length ? s.emails : [""]);
        setPhones(s.phones?.length ? s.phones : [""]);
        setSocialLinks({
          instagram: s.social_links?.instagram ?? "",
          threads:   s.social_links?.threads   ?? "",
          x:         s.social_links?.x         ?? "",
          facebook:  s.social_links?.facebook  ?? "",
        });
        setAddress(s.address ?? "");
        setOfficeHours(s.office_hours ?? "");
        setGoogleMapIframe(s.google_map_iframe ?? "");
      } catch (err: any) {
        toast.error("Failed to load website settings.");
      } finally {
        setSettingsLoading(false);
      }
    };
    load();
  }, [activeTab]);

  /* ── Handlers ──────────────────────────────────────── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      await apiRequest("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
        }),
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSavingPassword(true);
    try {
      await apiRequest("/api/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await apiRequest("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          site_name: siteName,
          site_tagline: siteTagline,
          meta_title: metaTitle,
          meta_description: metaDescription,
          meta_keywords: metaKeywords,
          logo_url: logoUrl,
          favicon_url: faviconUrl,
          emails: emails.filter(Boolean),
          phones: phones.filter(Boolean),
          social_links: socialLinks,
          address: address,
          office_hours: officeHours,
          google_map_iframe: googleMapIframe,
        }),
      });
      toast.success("Website settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  /* ── List field helpers ──────────────────────────── */
  const updateListItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, ""]);
  };

  const removeListItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  if (loading) return <AdminPageLoader />;

  return (
    <AdminShell activePage="Settings" headerTitle="Settings" user={user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">Settings</h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Manage your profile, security, and website configuration.
          </p>
        </div>

        {/* Tab Row */}
        <div className="flex gap-1 bg-zinc-100/80 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  isActive
                    ? "bg-white dark:bg-zinc-950 text-brand-orange shadow-sm border border-zinc-200 dark:border-zinc-800"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ───────────────────────────────────── */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                <User className="h-4 w-4" /> My Profile
              </h4>
              <Input label="Display Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
              <Input label="Email Address" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required />
              <Button type="submit" disabled={savingProfile}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-6 h-10 rounded-xl flex items-center gap-2 cursor-pointer">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
            </div>
          </form>
        )}

        {/* ── Password Tab ──────────────────────────────────── */}
        {activeTab === "password" && (
          <form onSubmit={handleSavePassword} className="space-y-6">
            <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                <KeyRound className="h-4 w-4" /> Change Password
              </h4>

              {[
                { label: "Current Password", value: currentPassword, setValue: setCurrentPassword, show: showCurrentPw, setShow: setShowCurrentPw },
                { label: "New Password",     value: newPassword,     setValue: setNewPassword,     show: showNewPw,     setShow: setShowNewPw },
                { label: "Confirm New Password", value: confirmPassword, setValue: setConfirmPassword, show: showNewPw, setShow: () => {} },
              ].map(({ label, value, setValue, show, setShow }, i) => (
                <div key={i} className="relative">
                  <Input
                    label={label}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                  {i < 2 && (
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-600 cursor-pointer">
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              ))}

              <Button type="submit" disabled={savingPassword}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-6 h-10 rounded-xl flex items-center gap-2 cursor-pointer">
                {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Update Password
              </Button>
            </div>
          </form>
        )}

        {/* ── Website Settings Tab ───────────────────────────── */}
        {activeTab === "website" && (
          settingsLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="animate-spin h-8 w-8 text-brand-orange" />
            </div>
          ) : (
            <form onSubmit={handleSaveWebsite} className="space-y-6">

              {/* Site Identity */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <Settings2 className="h-4 w-4" /> Site Identity
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Site Name" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g. Web Creation Nepal" required />
                  <Input label="Site Tagline" value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} placeholder="e.g. SEO & Web Development Agency" />
                </div>
              </div>

              {/* SEO / Homepage Meta */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <Globe className="h-4 w-4" /> SEO — Homepage Meta
                </h4>
                <Input label="Meta Title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="e.g. Web Creation Nepal | SEO & Web Development" />
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="Homepage meta description for search engines..."
                    className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                  />
                </div>
                <Input label="Meta Keywords" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} placeholder="e.g. web development, seo, nepal" />
              </div>

              {/* Logo & Favicon */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <ImageIcon className="h-4 w-4" /> Logo & Favicon
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Section */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                      Website Logo
                    </label>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingLogo}
                    />

                    {uploadingLogo ? (
                      <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                        <Loader2 className="animate-spin h-6 w-6 text-brand-orange mb-2" />
                        <span className="text-[10px] font-bold animate-pulse">Uploading logo...</span>
                      </div>
                    ) : logoUrl ? (
                      <div className="border border-zinc-250 dark:border-zinc-800 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-955/20 flex flex-col items-center gap-3">
                        <div className="h-16 w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="px-2.5 py-1 text-[10px] font-extrabold uppercase border border-zinc-250 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            Change Logo
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogoUrl("")}
                            className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-md transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => logoInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-zinc-300 hover:border-brand-orange dark:border-zinc-800 dark:hover:border-brand-orange rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 cursor-pointer hover:bg-brand-orange/5 transition-all"
                      >
                        <Upload className="h-6 w-6 mb-2 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Upload Website Logo
                        </span>
                        <span className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                          Supports PNG, JPG, WEBP, SVG
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Favicon Section */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                      Website Favicon
                    </label>
                    <input
                      type="file"
                      ref={faviconInputRef}
                      onChange={handleFaviconUpload}
                      accept="image/*,image/x-icon"
                      className="hidden"
                      disabled={uploadingFavicon}
                    />

                    {uploadingFavicon ? (
                      <div className="h-32 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                        <Loader2 className="animate-spin h-6 w-6 text-brand-orange mb-2" />
                        <span className="text-[10px] font-bold animate-pulse">Uploading favicon...</span>
                      </div>
                    ) : faviconUrl ? (
                      <div className="border border-zinc-250 dark:border-zinc-800 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-955/20 flex flex-col items-center gap-3">
                        <div className="h-16 w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 flex items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => faviconInputRef.current?.click()}
                            className="px-2.5 py-1 text-[10px] font-extrabold uppercase border border-zinc-250 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          >
                            Change Favicon
                          </button>
                          <button
                            type="button"
                            onClick={() => setFaviconUrl("")}
                            className="px-2.5 py-1 text-[10px] font-extrabold uppercase text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-md transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => faviconInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-zinc-300 hover:border-brand-orange dark:border-zinc-800 dark:hover:border-brand-orange rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 cursor-pointer hover:bg-brand-orange/5 transition-all"
                      >
                        <Upload className="h-6 w-6 mb-2 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                          Upload Website Favicon
                        </span>
                        <span className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-0.5">
                          Supports ICO, PNG, WEBP
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information & Google Map */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <MapPin className="h-4 w-4" /> Contact Info & Google Map
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Physical Address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="e.g. Web Creation Nepal, Kathmandu, Nepal" 
                  />
                  <Input 
                    label="Office Open Hours" 
                    value={officeHours} 
                    onChange={(e) => setOfficeHours(e.target.value)} 
                    placeholder="e.g. Sunday - Friday: 09:00 AM - 06:00 PM" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                    Google Map Embed Iframe code
                  </label>
                  <textarea
                    value={googleMapIframe}
                    onChange={(e) => setGoogleMapIframe(e.target.value)}
                    rows={4}
                    placeholder="Paste <iframe ...></iframe> code here..."
                    className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 font-mono text-xs"
                  />
                </div>

                {googleMapIframe && (
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5">
                      <Map className="h-3.5 w-3.5" /> Map Preview:
                    </span>
                    <div 
                      className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950/40 relative [&_iframe]:w-full [&_iframe]:h-[250px]"
                      dangerouslySetInnerHTML={{ __html: googleMapIframe }}
                    />
                  </div>
                )}
              </div>

              {/* Contact: Emails */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Addresses
                  </h4>
                  <button type="button" onClick={() => addListItem(emails, setEmails)}
                    className="text-[10px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add Email
                  </button>
                </div>
                <div className="space-y-3">
                  {emails.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateListItem(emails, setEmails, idx, e.target.value)}
                        placeholder={`info@example.com`}
                        className="flex-1 h-10 px-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                      />
                      {emails.length > 1 && (
                        <button type="button" onClick={() => removeListItem(emails, setEmails, idx)}
                          className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact: Phone Numbers */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone Numbers
                  </h4>
                  <button type="button" onClick={() => addListItem(phones, setPhones)}
                    className="text-[10px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> Add Phone
                  </button>
                </div>
                <div className="space-y-3">
                  {phones.map((phone, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updateListItem(phones, setPhones, idx, e.target.value)}
                        placeholder={`+977 98XXXXXXXX`}
                        className="flex-1 h-10 px-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                      />
                      {phones.length > 1 && (
                        <button type="button" onClick={() => removeListItem(phones, setPhones, idx)}
                          className="text-zinc-400 hover:text-red-500 cursor-pointer transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-5 shadow-sm backdrop-blur-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
                  <MessageCircle className="h-4 w-4" /> Social Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: "instagram" as const, label: "Instagram URL",  icon: Link2, placeholder: "https://instagram.com/yourpage" },
                    { key: "threads"   as const, label: "Threads URL",    icon: MessageCircle, placeholder: "https://threads.net/@yourpage" },
                    { key: "x"         as const, label: "X (Twitter) URL", icon: Link2,   placeholder: "https://x.com/yourhandle" },
                    { key: "facebook"  as const, label: "Facebook URL",   icon: Link2,   placeholder: "https://facebook.com/yourpage" },
                  ].map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key} className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </label>
                      <input
                        type="url"
                        value={socialLinks[key]}
                        onChange={(e) => setSocialLinks({ ...socialLinks, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end pt-2">
                <Button type="submit" disabled={savingSettings}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-8 h-11 rounded-xl shadow-md shadow-brand-orange/15 flex items-center gap-2 cursor-pointer">
                  {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Website Settings
                </Button>
              </div>
            </form>
          )
        )}
      </div>
    </AdminShell>
  );
}
