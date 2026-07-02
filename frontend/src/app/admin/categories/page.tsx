import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CategoriesClientPage from "@/components/admin/CategoriesClientPage";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
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

  let categories = [];
  try {
    const res = await fetch(`${apiUrl}/api/categories`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      categories = data.data || data || [];
    }
  } catch (err) {
    console.error("Server-side categories fetch error:", err);
  }

  let userProfile = null;
  try {
    const meRes = await fetch(`${apiUrl}/api/me`, { headers, cache: "no-store" });
    if (meRes.ok) {
      const meData = await meRes.json();
      userProfile = meData.user;
    }
  } catch { /* ignore */ }

  return <CategoriesClientPage initialCategories={categories} user={userProfile} />;
}
