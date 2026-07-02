import * as React from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import PostEditClient from "@/components/admin/PostEditClient";

export const dynamic = "force-dynamic";

interface AdminPostEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPostEditPage(props: AdminPostEditPageProps) {
  const { id } = await props.params;
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

  // 1. Fetch Post details
  let postData = null;
  try {
    const res = await fetch(`${apiUrl}/api/posts/${id}`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      const body = await res.json();
      postData = body.data;
    } else if (res.status === 404) {
      notFound();
    }
  } catch (err) {
    console.error("Server-side post edit fetch error:", err);
  }

  if (!postData) {
    notFound();
  }

  // 2. Fetch User profile
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

  return <PostEditClient initialPost={postData} user={userProfile} />;
}
