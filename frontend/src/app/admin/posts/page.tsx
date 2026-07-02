import * as React from "react";
import { cookies } from "next/headers";
import PostsClientPage from "@/components/admin/PostsClientPage";

export const dynamic = "force-dynamic";

interface AdminPostsPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AdminPostsPage(props: AdminPostsPageProps) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_auth_token")?.value;

  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 1. Build Query Parameters
  const queryParams = new URLSearchParams();
  if (searchParams.search) queryParams.append("search", searchParams.search);
  if (searchParams.page) queryParams.append("page", searchParams.page);
  queryParams.append("all", "1"); // Request to fetch drafts too
  queryParams.append("limit", "10");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // 2. Fetch Posts
  let postsData = { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
  try {
    const res = await fetch(`${apiUrl}/api/posts?${queryParams.toString()}`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      postsData = await res.json();
    }
  } catch (err) {
    console.error("Server-side posts fetch error:", err);
  }

  // 3. Fetch User profile
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

  return (
    <PostsClientPage
      initialPosts={postsData.data || []}
      initialMeta={postsData.meta || { current_page: 1, last_page: 1, total: (postsData.data || []).length }}
      user={userProfile}
      searchParams={searchParams}
    />
  );
}
