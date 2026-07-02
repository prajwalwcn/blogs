"use client";

import * as React from "react";
import { Sparkles, ImageIcon, Loader2, Globe, Upload, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export interface AuthorFormData {
  name: string;
  slug: string;
  bio: string;
  image_url: string;
  twitter_handle: string;
  linkedin_url: string;
}

interface AuthorFormProps {
  initialData?: Partial<AuthorFormData>;
  onSubmit?: (data: AuthorFormData) => void | Promise<void>;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  mode: "create" | "edit";
  onCancel?: () => void;
}

export default function AuthorForm({
  initialData,
  onSubmit,
  isLoading = false,
  errors = {},
  mode,
  onCancel,
}: AuthorFormProps) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [twitterHandle, setTwitterHandle] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");

  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? "");
      setSlug(initialData.slug ?? "");
      setBio(initialData.bio ?? "");
      setImageUrl(initialData.image_url ?? "");
      setTwitterHandle(initialData.twitter_handle ?? "");
      setLinkedinUrl(initialData.linkedin_url ?? "");
    }
  }, [initialData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const resData = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });

      setImageUrl(resData.url);
      toast.success("Profile photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Auto-slugify helper
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === "create") {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const generateSlug = () => {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        name,
        slug,
        bio,
        image_url: imageUrl,
        twitter_handle: twitterHandle,
        linkedin_url: linkedinUrl,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: Main Author Details */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Section 1: Basic Identity */}
        <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
            <Sparkles className="h-4 w-4" />
            <span>Author Identity</span>
          </h4>

          <div className="space-y-4">
            <Input
              label="Author Full Name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={handleNameChange}
              required
              error={errors.name?.[0]}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Profile URL Slug
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="text-[10px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> Regenerate
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs text-zinc-400 font-semibold select-none">
                  /authors/
                </span>
                <input
                  type="text"
                  placeholder="jane-doe"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full h-10 pl-[68px] pr-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm font-semibold outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                />
              </div>
              {errors.slug?.[0] && (
                <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.slug[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Author Short Bio
              </label>
              <textarea
                placeholder="Write a brief background about the author..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
              />
              {errors.bio?.[0] && (
                <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.bio[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Social Links */}
        <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
            <Globe className="h-4 w-4" />
            <span>Social Handles & Profiles</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Twitter / X Handle"
              placeholder="e.g. janedoe_seo"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              error={errors.twitter_handle?.[0]}
            />

            <Input
              label="LinkedIn URL"
              placeholder="e.g. https://linkedin.com/in/janedoe"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              error={errors.linkedin_url?.[0]}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold px-6 h-11 rounded-xl shadow-md shadow-brand-orange/15 flex items-center gap-2 cursor-pointer"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Add Author Profile" : "Save Profile Changes"}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 font-bold px-5 h-11 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Profile Picture & Live Preview */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Profile Image & Preview */}
        <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
          <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
            <ImageIcon className="h-4 w-4" />
            <span>Profile Photo</span>
          </h4>

          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="h-36 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
                <Loader2 className="animate-spin h-8 w-8 text-brand-orange mb-2" />
                <span className="text-xs font-semibold animate-pulse">Uploading photo...</span>
              </div>
            ) : imageUrl ? (
              <div className="flex flex-col items-center justify-center p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20">
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-full border border-emerald-250/20 mb-3 align-self-start">
                  Live Preview
                </span>
                <div className="h-28 w-28 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850 shadow-md mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={name || "Author Preview"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";
                    }}
                  />
                </div>
                <h5 className="font-extrabold text-sm text-zinc-900 dark:text-white mt-1">
                  {name || "Author Name"}
                </h5>
                <p className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 mt-0.5 mb-4">
                  {twitterHandle ? `@${twitterHandle}` : ""}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileSelect}
                    className="border-zinc-200 dark:border-zinc-800 text-xs font-bold px-3 h-8 rounded-lg cursor-pointer"
                  >
                    Change Photo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 text-xs font-bold px-3 h-8 rounded-lg cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={triggerFileSelect}
                className="h-36 border-2 border-dashed border-zinc-300 hover:border-brand-orange dark:border-zinc-800 dark:hover:border-brand-orange rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 cursor-pointer hover:bg-brand-orange/5 transition-all"
              >
                <Upload className="h-8 w-8 mb-2 stroke-1 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Click to select or upload image
                </span>
                <span className="text-[9px] text-zinc-450 dark:text-zinc-500 mt-1">
                  Supports JPG, PNG, WEBP, SVG
                </span>
              </div>
            )}
            {errors.image_url?.[0] && (
              <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.image_url[0]}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
