"use client";

import * as React from "react";
import { Sparkles, ImageIcon, Globe, Loader2, Upload, FolderHeart, Tag as TagIcon, Users, PlusCircle, Trash2, HelpCircle, Plus, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import RichTextEditor from "@/components/ui/rich-text-editor";

export interface BlogFormData {
  name: string;
  slug: string;
  excerpt: string;
  description: Array<{ title: string; content: string }> | string;
  image_url: string;
  image_alt: string;
  image_caption: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  author_id?: number | null;
  read_time?: number | null;
  category_ids?: number[];
  tag_ids?: number[];
  allow_comments?: boolean;
  faq?: Array<{ question: string; answer: string }>;
}

interface AuthorOption {
  id: number;
  name: string;
}

interface CategoryOption {
  id: number;
  name: string;
}

interface TagOption {
  id: number;
  name: string;
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData> & {
    categories?: Array<{ id: number; name: string }>;
    tags?: Array<{ id: number; name: string }>;
  };
  onSubmit?: (data: BlogFormData) => void | Promise<void>;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  mode: "create" | "edit" | "view";
  onCancel?: () => void;
}

export default function BlogForm({
  initialData,
  onSubmit,
  isLoading = false,
  errors = {},
  mode,
  onCancel,
}: BlogFormProps) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [sections, setSections] = React.useState<Array<{ title: string; content: string }>>([]);
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [imageCaption, setImageCaption] = React.useState("");
  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [metaKeywords, setMetaKeywords] = React.useState("");

  // New Fields
  const [authorId, setAuthorId] = React.useState("");
  const [readTime, setReadTime] = React.useState<number>(5);
  const [allowComments, setAllowComments] = React.useState(true);
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>([]);
  const [selectedTags, setSelectedTags] = React.useState<number[]>([]);

  // FAQ State
  const [faqs, setFaqs] = React.useState<Array<{ question: string; answer: string }>>([]);

  // Selection Options
  const [authors, setAuthors] = React.useState<AuthorOption[]>([]);
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [tags, setTags] = React.useState<TagOption[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(true);

  // Upload States
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // New Tag Creation States
  const [newTagName, setNewTagName] = React.useState("");
  const [creatingTag, setCreatingTag] = React.useState(false);

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;
    try {
      setCreatingTag(true);
      const res = await apiRequest("/api/tags", {
        method: "POST",
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      const createdTag = res.data;
      if (createdTag && createdTag.id) {
        setTags((prev) => [...prev, createdTag]);
        setSelectedTags((prev) => [...prev, createdTag.id]);
        setNewTagName("");
        toast.success(`Tag "#${createdTag.name}" created and selected!`);
      } else {
        throw new Error("Invalid response format from tag creation API.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create new tag.");
    } finally {
      setCreatingTag(false);
    }
  };

  // Drag states for repeater sections
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isView) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (isView) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (isView) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...sections];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    setSections(updated);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Fetch authors, categories, tags
  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
          apiRequest("/api/authors"),
          apiRequest("/api/categories"),
          apiRequest("/api/tags"),
        ]);
        setAuthors(authorsRes.data || authorsRes);
        setCategories(categoriesRes.data || categoriesRes);
        setTags(tagsRes.data || tagsRes);
      } catch (err: any) {
        toast.error("Failed to load options: " + err.message);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // Load initialData when it changes
  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setExcerpt((initialData as any).excerpt || "");
      
      let initialSections: Array<{ title: string; content: string }> = [];
      if (initialData.description) {
        if (Array.isArray(initialData.description)) {
          initialSections = initialData.description;
        } else if (typeof initialData.description === "string") {
          try {
            const parsed = JSON.parse(initialData.description);
            if (Array.isArray(parsed)) {
              initialSections = parsed;
            } else {
              initialSections = [{ title: "Introduction", content: initialData.description }];
            }
          } catch {
            initialSections = [{ title: "Introduction", content: initialData.description }];
          }
        }
      }
      setSections(initialSections);

      setImageUrl(initialData.image_url || "");
      setImageAlt(initialData.image_alt || "");
      setImageCaption(initialData.image_caption || "");
      setMetaTitle(initialData.meta_title || "");
      setMetaDescription(initialData.meta_description || "");
      setMetaKeywords(initialData.meta_keywords || "");

      setAuthorId(initialData.author_id ? String(initialData.author_id) : "");
      setReadTime(initialData.read_time ?? 5);
      setAllowComments(initialData.allow_comments !== false);

      if (initialData.category_ids) {
        setSelectedCategories(initialData.category_ids);
      } else if ((initialData as any).categories) {
        setSelectedCategories(((initialData as any).categories as any[]).map((c) => c.id));
      } else {
        setSelectedCategories([]);
      }

      if (initialData.tag_ids) {
        setSelectedTags(initialData.tag_ids);
      } else if ((initialData as any).tags) {
        setSelectedTags(((initialData as any).tags as any[]).map((t) => t.id));
      } else {
        setSelectedTags([]);
      }

      if ((initialData as any).faq) {
        setFaqs((initialData as any).faq);
      }
    }
  }, [initialData]);

  // Auto-generate slug from name in create mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === "create") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  // Upload handler calling backend API through apiRequest proxy
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
      toast.success("Cover image uploaded successfully!");
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

  const toggleCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((cid) => cid !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const toggleTag = (id: number) => {
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter((tid) => tid !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view" || !onSubmit) return;

    onSubmit({
      name,
      slug,
      excerpt,
      description: sections,
      image_url: imageUrl,
      image_alt: imageAlt,
      image_caption: imageCaption,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: metaKeywords,
      author_id: authorId ? Number(authorId) : null,
      read_time: readTime,
      category_ids: selectedCategories,
      tag_ids: selectedTags,
      allow_comments: allowComments,
      faq: faqs,
    });
  };

  const isView = mode === "view";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Grid Layout: Left vs Right column with a gap spacing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Basic Info & Cover Image */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <Sparkles className="h-4 w-4" />
              <span>Basic Information</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Blog Name"
                placeholder="e.g. Technology & Code Tutorials"
                value={name}
                onChange={handleNameChange}
                required
                disabled={isView}
                error={errors.name?.[0]}
              />

              <Input
                label="URL Slug"
                placeholder="e.g. technology-code-tutorials"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isView}
                error={errors.slug?.[0]}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Excerpt (Summary) <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="A compelling excerpt or summary of the blog..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                required
                disabled={isView}
                rows={3}
                className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60"
              />
            </div>

            <div className="w-full space-y-4 border-t border-zinc-150 pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Blog Content Sections (Repeater)
                </label>
                {!isView && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSections([...sections, { title: "", content: "" }])}
                    className="h-7 text-[10px] font-bold border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Section
                  </Button>
                )}
              </div>

              {sections.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-2">
                  No content sections added yet. Click &quot;Add Section&quot; to build your blog sections.
                </p>
              ) : (
                <div className="space-y-6">
                  {sections.map((section, idx) => (
                    <div
                      key={idx}
                      draggable={!isView}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={cn(
                        "border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 bg-zinc-50/20 dark:bg-zinc-950/10 relative transition-all duration-200",
                        draggedIndex === idx && "opacity-30 scale-95 border-brand-orange/30 shadow-inner",
                        !isView && "hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      {!isView && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                          {/* Drag handle */}
                          <div
                            title="Drag to reorder"
                            className="text-zinc-400 hover:text-zinc-650 cursor-grab active:cursor-grabbing p-1 rounded transition-colors"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => setSections(sections.filter((_, i) => i !== idx))}
                            className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Section #{idx + 1} Title (Heading) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isView}
                          placeholder="e.g. 1. Introduction to next-gen SEO"
                          value={section.title}
                          onChange={(e) => {
                            const updated = [...sections];
                            updated[idx].title = e.target.value;
                            setSections(updated);
                          }}
                          className="w-full h-10 px-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-450">
                          Section Content (Body Rich Text) <span className="text-red-500">*</span>
                        </label>
                        <RichTextEditor
                          placeholder="Compose section body content..."
                          value={section.content}
                          onChange={(contentStr) => {
                            const updated = [...sections];
                            updated[idx].content = contentStr;
                            setSections(updated);
                          }}
                          disabled={isView}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Cover Image Select Area */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <ImageIcon className="h-4 w-4" />
              <span>Cover Image</span>
            </h4>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isView || uploading}
            />

            {!imageUrl ? (
              /* Image Upload Area when no image is registered */
              <div
                onClick={!isView && !uploading ? triggerFileSelect : undefined}
                className={cn(
                  "border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-8 text-center flex flex-col items-center justify-center transition-all min-h-[200px] w-full",
                  !isView && !uploading ? "hover:border-brand-orange hover:bg-brand-orange/5 cursor-pointer" : "opacity-60 cursor-not-allowed"
                )}
              >
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin h-10 w-10 text-brand-orange mb-3" />
                    <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400 animate-pulse">
                      Uploading Cover Image...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-zinc-400 mb-3" />
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      Click to upload cover image file
                    </span>
                    <span className="text-[10px] text-zinc-450 dark:text-zinc-550">
                      Supports JPEG, PNG, WEBP, SVG (Max 5MB)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              /* Image File Manager Layout when image is uploaded */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-in fade-in duration-200">
                {/* Image Preview and File Details (Left) */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/55 dark:bg-zinc-950/20 p-4 space-y-3 relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full border border-brand-green/20">
                      Cover File Registered
                    </span>
                    {!isView && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                        title="Remove cover image"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl.startsWith("http") ? imageUrl : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/api\/?$/, "").replace(/\/$/, "") + (imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`)}
                      alt={imageAlt || "Cover Image Preview"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500";
                      }}
                    />
                  </div>

                  <div className="pt-1">
                    <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 break-all bg-white dark:bg-zinc-950 p-2 rounded border border-zinc-200/60 dark:border-zinc-850">
                      File Path: {imageUrl}
                    </p>
                  </div>
                </div>

                {/* Alt and Caption Metadata Inputs (Right) */}
                <div className="space-y-4">
                  <Input
                    label="Image Alt Text"
                    placeholder="e.g. Cover image of technical laptop display"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    disabled={isView}
                    error={errors.image_alt?.[0]}
                  />

                  <Input
                    label="Image Caption"
                    placeholder="e.g. Photo by John Doe on Unsplash"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    disabled={isView}
                    error={errors.image_caption?.[0]}
                  />
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Settings, Categories, Tags, SEO */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 3: Settings & Parameters */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <Users className="h-4 w-4" />
              <span>Settings & Parameters</span>
            </h4>

            {optionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin h-5 w-5 text-brand-orange" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Assign Blog Author
                  </label>
                  <select
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    disabled={isView}
                    className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">-- No Author Assigned --</option>
                    {authors.map((auth) => (
                      <option key={auth.id} value={String(auth.id)}>
                        {auth.name}
                      </option>
                    ))}
                  </select>
                  {errors.author_id?.[0] && (
                    <p className="text-[10px] font-semibold text-red-500 mt-1">{errors.author_id[0]}</p>
                  )}
                </div>

                <Input
                  label="Average Read Time (Minutes)"
                  type="number"
                  min={0}
                  value={readTime}
                  onChange={(e) => setReadTime(Number(e.target.value))}
                  disabled={isView}
                  error={errors.read_time?.[0]}
                />

                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    disabled={isView}
                    className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4.5 w-4.5"
                  />
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-350">
                    Allow Comments on Blog
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Section 4: Categories Selection */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <FolderHeart className="h-4 w-4" />
              <span>Select Categories</span>
            </h4>

            {optionsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="animate-spin h-4 w-4 text-brand-orange" />
              </div>
            ) : categories.length === 0 ? (
              <p className="text-[11px] text-zinc-450 dark:text-zinc-550 italic font-semibold">
                No taxonomy categories loaded. Check administration settings to insert categories.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 max-h-[200px] overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      disabled={isView}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                        isSelected
                          ? "bg-brand-orange/15 border-brand-orange text-brand-orange"
                          : "bg-white dark:bg-zinc-900/35 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                      )}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Tags Selection */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <TagIcon className="h-4 w-4" />
              <span>Select Tag Marks Markups</span>
            </h4>

            {optionsLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="animate-spin h-4 w-4 text-brand-orange" />
              </div>
            ) : (
              <>
                {tags.length === 0 ? (
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-550 italic font-semibold mb-3">
                    No tag marks registered. Enter a name below to create and select one.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1 max-h-[200px] overflow-y-auto pr-1 mb-3">
                    {tags.map((t) => {
                      const isSelected = selectedTags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTag(t.id)}
                          disabled={isView}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                            isSelected
                              ? "bg-brand-orange/15 border-brand-orange text-brand-orange"
                              : "bg-white dark:bg-zinc-900/35 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400"
                          )}
                        >
                          #{t.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!isView && (
                  <div className="flex gap-2 items-center border-t border-zinc-150 dark:border-zinc-800/80 pt-3">
                    <input
                      type="text"
                      placeholder="Add new tag mark..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewTag();
                        }
                      }}
                      className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-brand-orange text-zinc-900 dark:text-zinc-150"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={creatingTag || !newTagName.trim()}
                      onClick={handleAddNewTag}
                      className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold shrink-0 cursor-pointer h-[34px] px-3 flex items-center gap-1"
                    >
                      {creatingTag ? (
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      <span>Add Tag</span>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Section 6: SEO Headers */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <Globe className="h-4 w-4" />
              <span>SEO Headers & Tags</span>
            </h4>

            <Input
              label="SEO Meta Title"
              placeholder="Defaults to Blog Name if left empty"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={isView}
              error={errors.meta_title?.[0]}
            />

            <div className="w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                SEO Meta Description
              </label>
              <textarea
                placeholder="Defaults to Blog Description if left empty"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                disabled={isView}
                rows={5}
                className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-zinc-50 dark:disabled:bg-zinc-950"
              />
            </div>

            <Input
              label="SEO Meta Keywords"
              placeholder="e.g. technology, code, nextjs, tutorials"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              disabled={isView}
              error={errors.meta_keywords?.[0]}
            />
          </div>

        </div>

      </div>

      {/* FAQ Builder — full width below the two-column grid */}
      <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-855 pb-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Frequently Asked Questions</span>
          </h4>
          {!isView && (
            <button
              type="button"
              onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
              className="text-[10px] font-bold text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add Question
            </button>
          )}
        </div>

        {faqs.length === 0 ? (
          <p className="text-[11px] text-zinc-450 dark:text-zinc-550 italic font-semibold">
            No FAQs added yet. Click &quot;Add Question&quot; to build an FAQ section for this blog.
          </p>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 bg-zinc-50/40 dark:bg-zinc-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                    FAQ #{index + 1}
                  </span>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                      className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Question</label>
                  <input
                    type="text"
                    placeholder="e.g. What is the average response time?"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[index] = { ...updated[index], question: e.target.value };
                      setFaqs(updated);
                    }}
                    disabled={isView}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Answer</label>
                  <textarea
                    placeholder="Provide a clear, helpful answer..."
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[index] = { ...updated[index], answer: e.target.value };
                      setFaqs(updated);
                    }}
                    disabled={isView}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-white dark:bg-zinc-900/50 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-55 dark:hover:bg-zinc-900 text-xs font-bold"
          >
            {isView ? "Back to List" : "Cancel"}
          </Button>
        )}

        {!isView && (
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-6 min-w-[125px]"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="animate-spin h-3.5 w-3.5" />
                <span>Saving...</span>
              </span>
            ) : (
              <span>{mode === "create" ? "Create Blog" : "Save Changes"}</span>
            )}
          </Button>
        )}
      </div>

    </form>
  );
}
