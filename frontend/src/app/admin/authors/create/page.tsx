import * as React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthorCreateClient from "./AuthorCreateClient";

export const dynamic = "force-dynamic";

export default async function AdminAuthorCreatePage() {
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

  // Fetch User Profile
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

  return <AuthorCreateClient user={userProfile} />;
}
