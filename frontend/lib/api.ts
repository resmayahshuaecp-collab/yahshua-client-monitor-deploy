import axios, { type InternalAxiosRequestConfig } from "axios";

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:8085";

export function apiUrl(path: string): string {
  return `${BACKEND_ORIGIN}/api${path}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

// Axios's own config type has no room for our retry flag, so we extend it
// locally rather than reaching for `any`.
interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  __retried?: boolean;
}

export const api = axios.create({
  baseURL: `${BACKEND_ORIGIN}/api`,
  // The access token lives in an httpOnly cookie, so nothing here can read
  // it. This flag is what makes the browser send it.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const token = readCookie("csrftoken");
    if (token) config.headers.set("X-CSRFToken", token);
  }
  return config;
});

let refreshing: Promise<void> | null = null;

// Exported (not just used inline below) so the redirect-vs-rethrow branching
// can be exercised directly in tests without standing up a real HTTP mock.
export async function handleResponseError(error: unknown) {
  if (!axios.isAxiosError(error)) throw error;
  const config = error.config as RetriableRequestConfig | undefined;
  if (error.response?.status !== 401 || !config) {
    // Includes 403: Django uses 401 solely for "not authenticated" and 403
    // for role refusals, and a logged-in user with the wrong role should
    // not get bounced to /login.
    throw error;
  }
  if (config.__retried) {
    // The retried request itself came back 401 -- refreshing did not fix it.
    if (typeof window !== "undefined") window.location.href = "/login";
    throw error;
  }
  config.__retried = true;

  // One shared refresh, so a page firing six queries at once does not
  // fire six refreshes and invalidate its own new token.
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((response) => {
      if (!response.ok) throw new Error("refresh failed");
    })
    .finally(() => {
      refreshing = null;
    });

  try {
    await refreshing;
  } catch {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw error;
  }
  return api.request(config);
}

api.interceptors.response.use((response) => response, handleResponseError);
