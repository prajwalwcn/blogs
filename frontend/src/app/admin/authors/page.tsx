import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthorsClientPage from "@/components/admin/AuthorsClientPage";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value;

  if (!token) {
    redirect("/wcnadmin");
  }

  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 1. Fetch Authors
  let authors = [];
  try {
    const res = await fetch(`${apiUrl}/api/authors`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      authors = data.data || [];
    }
  } catch (err) {
    console.error("Server-side authors fetch error:", err);
  }

  // 2. Fetch User Profile
  let userProfile = null;
  try {
    const meRes = await fetch(`${apiUrl}/api/me`, {
      headers,
      cache: "no-store",
    });
    if (meRes.ok) {
      const meData = await meRes.json();
      userProfile = meData.user;
    }
  } catch (err) {
    console.error("Server-side me fetch error:", err);
  }

  return <AuthorsClientPage initialAuthors={authors} user={userProfile} />;
}
