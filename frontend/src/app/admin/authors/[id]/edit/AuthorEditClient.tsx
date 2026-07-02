"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AuthorForm, { AuthorFormData } from "@/components/admin/AuthorForm";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface Author {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  image_url: string | null;
  twitter_handle: string | null;
  linkedin_url: string | null;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface AuthorEditClientProps {
  author: Author;
  user: UserProfile | null;
}

export default function AuthorEditClient({ author, user }: AuthorEditClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (data: AuthorFormData) => {
    setSubmitting(true);
    setValidationErrors({});
    try {
      await apiRequest(`/api/authors/${author.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Author profile updated successfully!");
      router.push("/admin/authors");
      router.refresh();
    } catch (err: any) {
      if (err.errors) {
        setValidationErrors(err.errors);
      }
      toast.error(err.message || "Failed to update author profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell activePage="Manage Authors" headerTitle={`Edit Author: ${author.name}`} user={user}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Edit Author Profile
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Update the information below to edit <span className="text-brand-orange">{author.name}</span>&apos;s profile.
          </p>
        </div>

        <AuthorForm
          mode="edit"
          initialData={{
            name: author.name,
            slug: author.slug,
            bio: author.bio ?? "",
            image_url: author.image_url ?? "",
            twitter_handle: author.twitter_handle ?? "",
            linkedin_url: author.linkedin_url ?? "",
          }}
          onSubmit={handleSubmit}
          isLoading={submitting}
          errors={validationErrors}
          onCancel={() => router.push("/admin/authors")}
        />
      </div>
    </AdminShell>
  );
}
