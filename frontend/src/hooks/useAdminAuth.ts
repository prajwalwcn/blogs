import * as React from "react";
import { useRouter } from "next/navigation";
import { apiRequest, removeAuthToken, getAuthToken } from "@/lib/api";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export interface UseAdminAuthResult {
  user: UserProfile | null;
  loading: boolean;
}

/**
 * Shared auth hook for admin pages.
 * Checks for a valid token, fetches /api/me, and redirects to /wcnadmin on 401.
 */
export function useAdminAuth(): UseAdminAuthResult {
  const router = useRouter();
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push("/wcnadmin");
      return;
    }

    apiRequest("/api/me")
      .then((data) => setUser(data.user))
      .catch((err: any) => {
        if (err.status === 401) {
          removeAuthToken();
          router.push("/wcnadmin");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  return { user, loading };
}
