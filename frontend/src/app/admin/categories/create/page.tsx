import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CategoryCreateClient from "./CategoryCreateClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoryCreatePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value;
  if (!token) redirect("/wcnadmin");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  let userProfile = null;
  try {
    const meRes = await fetch(`${apiUrl}/api/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (meRes.ok) userProfile = (await meRes.json()).user;
  } catch { /* ignore */ }

  return <CategoryCreateClient user={userProfile} />;
}
