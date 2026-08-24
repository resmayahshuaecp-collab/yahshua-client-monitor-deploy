import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, apiUrl, handleResponseError } from "@/lib/api";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  __retried?: boolean;
}

function axiosErrorWith(status: number, retried: boolean): AxiosError {
  const config: RetriableRequestConfig = {
    headers: new AxiosHeaders(),
    __retried: retried,
  };
  const error = new AxiosError("request failed");
  error.config = config;
  error.response = {
    status,
    statusText: "",
    headers: {},
    config,
    data: null,
  } as AxiosError["response"];
  return error;
}

describe("api client", () => {
  it("sends credentials so the httpOnly cookie rides along", () => {
    // Without this the cookie is never sent and every call 401s, which
    // looks like a broken token rather than a missing flag.
    expect(api.defaults.withCredentials).toBe(true);
  });

  it("builds backend urls against the configured origin", () => {
    expect(apiUrl("/auth/me")).toMatch(/\/api\/auth\/me$/);
  });

  it("does not point at the frontend's own origin", () => {
    expect(apiUrl("/auth/me")).not.toContain(":3003");
  });
});

describe("handleResponseError", () => {
  const originalLocation = window.location;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", { value: originalLocation, writable: true });
  });

  it("redirects to /login when an already-retried request 401s again", async () => {
    Object.defineProperty(window, "location", { value: { href: "" }, writable: true });
    const error = axiosErrorWith(401, true);

    await expect(handleResponseError(error)).rejects.toBe(error);

    expect(window.location.href).toBe("/login");
  });

  it("does not redirect on a 403, even for an already-retried request", async () => {
    Object.defineProperty(window, "location", { value: { href: "" }, writable: true });
    const error = axiosErrorWith(403, true);

    await expect(handleResponseError(error)).rejects.toBe(error);

    expect(window.location.href).toBe("");
  });

  it("re-throws non-axios errors untouched", async () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(false);
    const error = new Error("boom");

    await expect(handleResponseError(error)).rejects.toBe(error);
  });
});
