import * as React from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import CategoryEditClient from "./CategoryEditClient";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCategoryEditPage({ params }: EditPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value;
  if (!token) redirect("/wcnadmin");

  const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  let categories: any[] = [];
  try {
    const res = await fetch(`${apiUrl}/api/categories`, { headers, cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      categories = data.data || data || [];
    }
  } catch { /* ignore */ }

  const category = categories.find((c: any) => String(c.id) === id);
  if (!category) notFound();

  let userProfile = null;
  try {
    const meRes = await fetch(`${apiUrl}/api/me`, { headers, cache: "no-store" });
    if (meRes.ok) userProfile = (await meRes.json()).user;
  } catch { /* ignore */ }

  return <CategoryEditClient category={category} user={userProfile} />;
}
