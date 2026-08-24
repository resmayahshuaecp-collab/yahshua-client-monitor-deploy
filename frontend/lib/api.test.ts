import { describe, expect, it } from "vitest";
import { api, apiUrl } from "@/lib/api";

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
