"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AuthorForm, { AuthorFormData } from "@/components/admin/AuthorForm";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface AuthorCreateClientProps {
  user: UserProfile | null;
}

export default function AuthorCreateClient({ user }: AuthorCreateClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string[]>>({});

  const handleSubmit = async (data: AuthorFormData) => {
    setSubmitting(true);
    setValidationErrors({});
    try {
      await apiRequest("/api/authors", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Author profile created successfully!");
      router.push("/admin/authors");
      router.refresh();
    } catch (err: any) {
      if (err.errors) {
        setValidationErrors(err.errors);
      }
      toast.error(err.message || "Failed to create author profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell activePage="Manage Authors" headerTitle="Add New Author" user={user}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Add New Author
          </h1>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 font-semibold mt-1">
            Fill in the information below to add a new author profile to the directory.
          </p>
        </div>

        <AuthorForm
          mode="create"
          onSubmit={handleSubmit}
          isLoading={submitting}
          errors={validationErrors}
          onCancel={() => router.push("/admin/authors")}
        />
      </div>
    </AdminShell>
  );
}
