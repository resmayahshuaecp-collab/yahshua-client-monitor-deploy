import axios, { type InternalAxiosRequestConfig } from "axios";

const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:8085";
const isServer = typeof window === "undefined";
const BASE = isServer ? `${BACKEND_ORIGIN}/api` : "/api";

export function apiUrl(path: string): string {
  return `${BASE}${path}`;
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  __retried?: boolean;
}

export const api = axios.create({
  baseURL: BASE,
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

export async function handleResponseError(error: unknown) {
  if (!axios.isAxiosError(error)) throw error;
  const config = error.config as RetriableRequestConfig | undefined;
  if (error.response?.status !== 401 || !config) {
    throw error;
  }
  if (config.__retried) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw error;
  }
  config.__retried = true;

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