"use client";

import * as React from "react";
import { z } from "zod";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  HelpCircle, 
  FolderHeart, 
  Tag as TagIcon,
  Upload, 
  Loader2, 
  Plus, 
  Trash2, 
  Info,
  Calendar,
  Layers,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/ui/rich-text-editor";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Zod validation schema matching Laravel rules
export const postSchema = z.object({
  blog_id: z.string().min(1, "Please select a blog"),
  author_id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  slug: z.string().max(255, "Slug must be less than 255 characters").optional(),
  short_description: z.string().min(1, "Short description is required"),
  content: z.string().min(1, "Content is required"),
  read_time: z.number().int().min(1, "Read time must be at least 1 minute").optional(),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  allow_comments: z.boolean().default(true),
  priority: z.number().int().min(0, "Priority must be 0 or greater").default(0),
  
  // Image metadata
  image_url: z.string().optional(),
  image_alt: z.string().max(255).optional(),
  image_caption: z.string().max(255).optional(),
  thumbnail_url: z.string().optional(),
  thumbnail_alt: z.string().max(255).optional(),
  
  // SEO Metadata
  meta_title: z.string().max(255).optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  
  // Complex items
  faq: z.array(z.object({
    question: z.string().min(1, "Question cannot be empty"),
    answer: z.string().min(1, "Answer cannot be empty")
  })).default([]),
  
  gallery: z.array(z.object({
    url: z.string().min(1, "URL is required"),
    alt: z.string().max(255).optional(),
    caption: z.string().max(255).optional()
  })).default([]),
  
  category_ids: z.array(z.number()).default([]),
  tag_ids: z.array(z.number()).default([])
});

export type PostFormData = z.infer<typeof postSchema>;

interface BlogOption {
  id: number;
  name: string;
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

interface PostFormProps {
  mode: "create" | "edit" | "view";
  initialData?: Partial<PostFormData>;
  onSubmit?: (data: PostFormData) => void;
  isLoading?: boolean;
  errors?: Record<string, string[]>;
  onCancel: () => void;
}

export default function PostForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
  errors: serverErrors = {},
  onCancel,
}: PostFormProps) {
  const isView = mode === "view";

  // Option lists fetched on load
  const [blogs, setBlogs] = React.useState<BlogOption[]>([]);
  const [authors, setAuthors] = React.useState<AuthorOption[]>([]);
  const [categories, setCategories] = React.useState<CategoryOption[]>([]);
  const [tags, setTags] = React.useState<TagOption[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(true);

  // Form Fields State
  const [blogId, setBlogId] = React.useState(initialData?.blog_id ? String(initialData.blog_id) : "");
  const [authorId, setAuthorId] = React.useState(initialData?.author_id ? String(initialData.author_id) : "");
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [shortDescription, setShortDescription] = React.useState(initialData?.short_description || "");
  const [content, setContent] = React.useState(initialData?.content || "");
  const [readTime, setReadTime] = React.useState(initialData?.read_time || 5);
  const [isPublished, setIsPublished] = React.useState(initialData?.is_published || false);
  const [isFeatured, setIsFeatured] = React.useState(initialData?.is_featured || false);
  const [allowComments, setAllowComments] = React.useState(initialData?.allow_comments !== false);
  const [priority, setPriority] = React.useState(initialData?.priority || 0);

  // Cover Image
  const [imageUrl, setImageUrl] = React.useState(initialData?.image_url || "");
  const [imageAlt, setImageAlt] = React.useState(initialData?.image_alt || "");
  const [imageCaption, setImageCaption] = React.useState(initialData?.image_caption || "");

  // Thumbnail Image
  const [thumbnailUrl, setThumbnailUrl] = React.useState(initialData?.thumbnail_url || "");
  const [thumbnailAlt, setThumbnailAlt] = React.useState(initialData?.thumbnail_alt || "");

  // SEO
  const [metaTitle, setMetaTitle] = React.useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = React.useState(initialData?.meta_description || "");
  const [metaKeywords, setMetaKeywords] = React.useState(initialData?.meta_keywords || "");

  // FAQs
  const [faqs, setFaqs] = React.useState<Array<{ question: string; answer: string }>>(
    initialData?.faq || []
  );

  // Gallery
  const [gallery, setGallery] = React.useState<Array<{ url: string; alt?: string; caption?: string }>>(
    initialData?.gallery || []
  );

  // Selected Categories and Tags
  const [selectedCategories, setSelectedCategories] = React.useState<number[]>(
    initialData?.category_ids || []
  );
  const [selectedTags, setSelectedTags] = React.useState<number[]>(
    initialData?.tag_ids || []
  );

  // File Upload states
  const [uploadingCover, setUploadingCover] = React.useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = React.useState(false);
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = React.useState<number | null>(null);

  // Validation errors
  const [clientErrors, setClientErrors] = React.useState<Record<string, string>>({});

  const coverInputRef = React.useRef<HTMLInputElement>(null);
  const thumbnailInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRefs = React.useRef<Record<number, HTMLInputElement>>({});

  // Load selection dropdown lists
  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [blogsRes, authorsRes, categoriesRes, tagsRes] = await Promise.all([
          apiRequest("/api/blogs"),
          apiRequest("/api/authors"),
          apiRequest("/api/categories"),
          apiRequest("/api/tags"),
        ]);
        setBlogs(blogsRes.data || []);
        setAuthors(authorsRes.data || []);
        setCategories(categoriesRes.data || []);
        setTags(tagsRes.data || []);
      } catch (err) {
        toast.error("Failed to load dependency resources for posts configuration.");
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  // Sync title to slug automatically on create mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (mode === "create") {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  };

  // Upload Handlers
  const handleFileUpload = async (
    file: File,
    type: "cover" | "thumbnail" | "gallery",
    galleryIndex?: number
  ) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (type === "cover") setUploadingCover(true);
      else if (type === "thumbnail") setUploadingThumbnail(true);
      else if (galleryIndex !== undefined) setUploadingGalleryIdx(galleryIndex);

      const res = await apiRequest("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (type === "cover") {
        setImageUrl(res.url);
        toast.success("Cover image uploaded successfully!");
      } else if (type === "thumbnail") {
        setThumbnailUrl(res.url);
        toast.success("Thumbnail uploaded successfully!");
      } else if (galleryIndex !== undefined) {
        const updated = [...gallery];
        updated[galleryIndex] = { ...updated[galleryIndex], url: res.url };
        setGallery(updated);
        toast.success("Gallery image uploaded!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploadingCover(false);
      setUploadingThumbnail(false);
      setUploadingGalleryIdx(null);
    }
  };

  // FAQ Handlers
  const handleAddFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  const handleFaqChange = (idx: number, field: "question" | "answer", val: string) => {
    const updated = [...faqs];
    updated[idx][field] = val;
    setFaqs(updated);
  };

  // Gallery Handlers
  const handleAddGalleryItem = () => {
    setGallery([...gallery, { url: "", alt: "", caption: "" }]);
  };

  const handleRemoveGalleryItem = (idx: number) => {
    setGallery(gallery.filter((_, i) => i !== idx));
  };

  const handleGalleryChange = (
    idx: number,
    field: "url" | "alt" | "caption",
    val: string
  ) => {
    const updated = [...gallery];
    updated[idx] = { ...updated[idx], [field]: val };
    setGallery(updated);
  };

  // Category Toggle
  const toggleCategory = (catId: number) => {
    if (isView) return;
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Tag Toggle
  const toggleTag = (tagId: number) => {
    if (isView) return;
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isView || !onSubmit) return;

    setClientErrors({});

    const formData: PostFormData = {
      blog_id: blogId,
      author_id: authorId || undefined,
      title,
      slug: slug || undefined,
      short_description: shortDescription,
      content,
      read_time: readTime ? Number(readTime) : undefined,
      is_published: isPublished,
      is_featured: isFeatured,
      allow_comments: allowComments,
      priority: Number(priority),
      image_url: imageUrl || undefined,
      image_alt: imageAlt || undefined,
      image_caption: imageCaption || undefined,
      thumbnail_url: thumbnailUrl || undefined,
      thumbnail_alt: thumbnailAlt || undefined,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
      meta_keywords: metaKeywords || undefined,
      faq: faqs,
      gallery: gallery as any,
      category_ids: selectedCategories,
      tag_ids: selectedTags,
    };

    // Zod parsing on client
    const parseResult = postSchema.safeParse(formData);

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      parseResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path.join(".")] = err.message;
        }
      });
      setClientErrors(fieldErrors);
      toast.error("Form validation failed. Please check the fields.");
      return;
    }

    onSubmit(parseResult.data);
  };

  const getFieldError = (fieldName: string) => {
    return clientErrors[fieldName] || serverErrors[fieldName]?.[0];
  };

  if (optionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin h-8 w-8 text-brand-orange mb-2" />
        <span className="text-xs font-bold text-zinc-550 dark:text-zinc-400">
          Loading relational dependencies...
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Main Info, Media, FAQs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Core Details */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <Sparkles className="h-4 w-4" />
              <span>Core Post Details</span>
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Select Blog Target <span className="text-red-500">*</span>
                </label>
                <select
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  disabled={isView}
                  className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900 px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">-- Choose Blog --</option>
                  {blogs.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {getFieldError("blog_id") && (
                  <p className="text-[10px] font-semibold text-red-500 mt-1">{getFieldError("blog_id")}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Post Title"
                placeholder="e.g. Building microservices with NestJS"
                value={title}
                onChange={handleTitleChange}
                required
                disabled={isView}
                error={getFieldError("title")}
              />

              <Input
                label="Post URL Slug"
                placeholder="e.g. building-microservices-nestjs"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isView}
                error={getFieldError("slug")}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                Short description Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="A compelling 1-2 sentence hook to display on index pages..."
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                disabled={isView}
                rows={3}
                className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {getFieldError("short_description") && (
                <p className="text-[10px] font-semibold text-red-500 mt-1">{getFieldError("short_description")}</p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                HTML Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                placeholder="Compose the post body using custom formats..."
                value={content}
                onChange={setContent}
                disabled={isView}
                error={getFieldError("content")}
              />
            </div>
          </div>

          {/* Card 2: Cover & Thumbnail Images */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-6 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <ImageIcon className="h-4 w-4" />
              <span>Media Assets & Covers</span>
            </h4>

            {/* Cover image row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                  Cover Image File
                </label>
                <div
                  onClick={() => !isView && !uploadingCover && coverInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-6 text-center flex flex-col items-center justify-center transition-all h-[160px]",
                    !isView && !uploadingCover ? "hover:border-brand-orange hover:bg-brand-orange/5 cursor-pointer" : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "cover")}
                    accept="image/*"
                    className="hidden"
                    disabled={isView || uploadingCover}
                  />
                  {uploadingCover ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin h-7 w-7 text-brand-orange mb-2" />
                      <span className="text-[10px] font-bold text-zinc-550 dark:text-zinc-450 animate-pulse">Uploading Cover...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-7 w-7 text-zinc-400 mb-2" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Select or drop cover image</span>
                      <span className="text-[9px] text-zinc-450 mt-1">Supports web formats (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Cover Image URL"
                  placeholder="Or paste external absolute image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={isView}
                  error={getFieldError("image_url")}
                />

                {imageUrl && (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/20 p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded border border-brand-green/20">Live Cover Preview</span>
                      {!isView && (
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="text-[10px] font-semibold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center h-[90px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Cover Preview" className="h-full w-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cover Image Alt Text"
                placeholder="e.g. Visual microservice cluster diagram"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                disabled={isView}
                error={getFieldError("image_alt")}
              />
              <Input
                label="Cover Image Caption"
                placeholder="e.g. Illustration of system clusters"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                disabled={isView}
                error={getFieldError("image_caption")}
              />
            </div>

            {/* Thumbnail Row */}
            <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                  Thumbnail Image File
                </label>
                <div
                  onClick={() => !isView && !uploadingThumbnail && thumbnailInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl p-6 text-center flex flex-col items-center justify-center transition-all h-[140px]",
                    !isView && !uploadingThumbnail ? "hover:border-brand-orange hover:bg-brand-orange/5 cursor-pointer" : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "thumbnail")}
                    accept="image/*"
                    className="hidden"
                    disabled={isView || uploadingThumbnail}
                  />
                  {uploadingThumbnail ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin h-6 w-6 text-brand-orange mb-2" />
                      <span className="text-[10px] font-bold text-zinc-550 dark:text-zinc-450 animate-pulse">Uploading Thumbnail...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-6 w-6 text-zinc-400 mb-2" />
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Select thumbnail</span>
                      <span className="text-[9px] text-zinc-450 mt-1">1:1 square ratio recommended</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  label="Thumbnail Image URL"
                  placeholder="Or paste external thumbnail link..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  disabled={isView}
                  error={getFieldError("thumbnail_url")}
                />

                {thumbnailUrl && (
                  <div className="flex items-center gap-3 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 bg-zinc-50/50 dark:bg-zinc-950/20 max-w-[280px]">
                    <div className="h-12 w-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbnailUrl} alt="Thumbnail Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 truncate">Thumbnail Loaded</p>
                      {!isView && (
                        <button
                          type="button"
                          onClick={() => setThumbnailUrl("")}
                          className="text-[9px] font-bold text-red-500 hover:text-red-700 cursor-pointer mt-0.5"
                        >
                          Remove URL
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Thumbnail Alt Text"
                placeholder="e.g. Microservice icon badge"
                value={thumbnailAlt}
                onChange={(e) => setThumbnailAlt(e.target.value)}
                disabled={isView}
                error={getFieldError("thumbnail_alt")}
              />
            </div>
          </div>

          {/* Card 3: Dynamic Image Gallery */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Asset Photo Gallery</span>
              </h4>
              {!isView && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddGalleryItem}
                  className="h-7 text-[10px] font-bold border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Slide
                </Button>
              )}
            </div>

            {gallery.length === 0 ? (
              <p className="text-xs text-zinc-450 dark:text-zinc-550 italic text-center py-4 font-semibold">
                No extra gallery images configured. Click 'Add Slide' to register carousel media.
              </p>
            ) : (
              <div className="space-y-4">
                {gallery.map((item, idx) => (
                  <div
                    key={idx}
                    className="group relative border border-zinc-200 dark:border-zinc-800/60 p-4 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/10 space-y-3"
                  >
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
                        title="Remove Slide"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pt-2">
                      <div className="space-y-3">
                        <Input
                          label={`Slide #${idx + 1} Image URL`}
                          placeholder="Or select a local file to upload on the right..."
                          value={item.url}
                          onChange={(e) => handleGalleryChange(idx, "url", e.target.value)}
                          disabled={isView}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Alt Text"
                            placeholder="Alt text"
                            value={item.alt || ""}
                            onChange={(e) => handleGalleryChange(idx, "alt", e.target.value)}
                            disabled={isView}
                          />
                          <Input
                            label="Caption"
                            placeholder="Caption text"
                            value={item.caption || ""}
                            onChange={(e) => handleGalleryChange(idx, "caption", e.target.value)}
                            disabled={isView}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 items-center">
                        <div className="space-y-1 shrink-0">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Upload File
                          </label>
                          <div
                            onClick={() => !isView && uploadingGalleryIdx !== idx && galleryInputRefs.current[idx]?.click()}
                            className={cn(
                              "border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-3 text-center flex flex-col items-center justify-center transition-all h-[96px] w-[120px]",
                              !isView && uploadingGalleryIdx !== idx ? "hover:border-brand-orange hover:bg-brand-orange/5 cursor-pointer" : "opacity-60 cursor-not-allowed"
                            )}
                          >
                            <input
                              type="file"
                              ref={(el) => { if (el) galleryInputRefs.current[idx] = el; }}
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "gallery", idx)}
                              accept="image/*"
                              className="hidden"
                              disabled={isView || uploadingGalleryIdx === idx}
                            />
                            {uploadingGalleryIdx === idx ? (
                              <Loader2 className="animate-spin h-5 w-5 text-brand-orange" />
                            ) : (
                              <>
                                <Upload className="h-5 w-5 text-zinc-400 mb-1" />
                                <span className="text-[9px] font-bold text-zinc-650 dark:text-zinc-300">Select File</span>
                              </>
                            )}
                          </div>
                        </div>

                        {item.url && (
                          <div className="h-20 aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.url} alt="Slide preview" className="h-full w-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 4: Frequently Asked Questions (FAQ) */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Frequently Asked Questions</span>
              </h4>
              {!isView && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddFaq}
                  className="h-7 text-[10px] font-bold border-brand-orange/20 text-brand-orange hover:bg-brand-orange/5"
                >
                  <Plus className="h-3 w-3 mr-1" /> Add QA
                </Button>
              )}
            </div>

            {faqs.length === 0 ? (
              <p className="text-xs text-zinc-455 dark:text-zinc-555 italic text-center py-4 font-semibold">
                No FAQ item registered for this post. FAQs inject structured schema markup automatically.
              </p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="relative border border-zinc-200 dark:border-zinc-800/60 p-4 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/10 space-y-3"
                  >
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-md cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    <div className="space-y-3 pt-2">
                      <Input
                        label={`Q${idx + 1}: Question`}
                        placeholder="e.g. What is the execution model of NestJS?"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                        disabled={isView}
                        required
                      />

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                          Answer Content
                        </label>
                        <textarea
                          placeholder="Provide the answer explanation..."
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                          disabled={isView}
                          rows={3}
                          className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Settings, Categories, Tags, SEO */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 5: Post Parameters & Settings */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <Layers className="h-4 w-4" />
              <span>Flags & Parameters</span>
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Sort Order Priority"
                type="number"
                min={0}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                disabled={isView}
                error={getFieldError("priority")}
              />
            </div>

            {/* Checkbox Flags */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  disabled={isView}
                  className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4.5 w-4.5"
                />
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-350">
                  Publish Post Live
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  disabled={isView}
                  className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4.5 w-4.5"
                />
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-350">
                  Feature on Frontpage
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  disabled={isView}
                  className="rounded border-zinc-300 text-brand-orange focus:ring-brand-orange h-4.5 w-4.5"
                />
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-350">
                  Allow Comment Moderation
                </div>
              </label>
            </div>
          </div>

          {/* Card 6: Categories Taxonomies */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <FolderHeart className="h-4 w-4" />
              <span>Select Categories</span>
            </h4>

            {categories.length === 0 ? (
              <p className="text-[11px] text-zinc-450 dark:text-zinc-550 italic font-semibold">
                No taxonomy categories loaded. Check administration settings to insert categories.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
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

          {/* Card 7: Tag Taxonomies */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <TagIcon className="h-4 w-4" />
              <span>Select Tag Marks</span>
            </h4>

            {tags.length === 0 ? (
              <p className="text-[11px] text-zinc-450 dark:text-zinc-550 italic font-semibold">
                No tag marks registered. Insert tags inside taxonomy control cards first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
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
          </div>

          {/* Card 8: SEO Parameters */}
          <div className="bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/85 dark:border-zinc-800/80 p-6 rounded-2xl space-y-4 shadow-sm backdrop-blur-sm">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-orange flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-855 pb-3">
              <Globe className="h-4 w-4" />
              <span>SEO Headers & Meta</span>
            </h4>

            <Input
              label="SEO Title Tag"
              placeholder="Defaults to Post Title if empty"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              disabled={isView}
              error={getFieldError("meta_title")}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-550 dark:text-zinc-400">
                SEO Meta Description
              </label>
              <textarea
                placeholder="Defaults to short description hook if left blank..."
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                disabled={isView}
                rows={4}
                className="w-full rounded-lg border border-input bg-white dark:bg-zinc-900/50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-3 focus:ring-brand-orange/20 transition-all text-zinc-900 dark:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {getFieldError("meta_description") && (
                <p className="text-[10px] font-semibold text-red-500 mt-1">{getFieldError("meta_description")}</p>
              )}
            </div>

            <Input
              label="SEO Meta Keywords"
              placeholder="e.g. nestjs, microservices, cluster"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              disabled={isView}
              error={getFieldError("meta_keywords")}
            />
          </div>

        </div>

      </div>

      {/* FOOTER ACTIONS PANEL */}
      <div className="flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="px-5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-bold cursor-pointer transition-all"
        >
          Cancel
        </Button>
        {!isView && (
          <Button
            type="submit"
            disabled={isLoading}
            className="px-6 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/20 transition-all"
          >
            {isLoading && <Loader2 className="animate-spin h-4 w-4" />}
            <span>{mode === "create" ? "Create Post schema" : "Update Post details"}</span>
          </Button>
        )}
      </div>
    </form>
  );
}
