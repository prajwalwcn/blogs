import Cookies from "js-cookie";

const TOKEN_KEY = "admin_auth_token";

export function getAuthToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function removeAuthToken(): void {
  Cookies.remove(TOKEN_KEY);
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // Build URL with query params
  let url = endpoint;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/blog";
  if (url.startsWith("/") && basePath && basePath !== "/" && !url.startsWith(basePath)) {
    url = `${basePath}${url}`;
  }
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build headers
  const activeHeaders = new Headers(headers);
  if (!activeHeaders.has("Content-Type") && !(restOptions.body instanceof FormData)) {
    activeHeaders.set("Content-Type", "application/json");
  }
  activeHeaders.set("Accept", "application/json");

  // Read Sanctum Token from Cookies
  const token = getAuthToken();
  if (token) {
    activeHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: activeHeaders,
  });

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: "An unexpected error occurred" };
    }
    
    const errorMessage = errorData.message || `Request failed with status ${response.status}`;
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.errors = errorData.errors; // Validation errors from Laravel
    throw error;
  }

  return response.json();
}
