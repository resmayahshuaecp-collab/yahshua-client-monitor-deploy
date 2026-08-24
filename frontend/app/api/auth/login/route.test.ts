import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes through a non-JSON upstream error instead of crashing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<html>500</html>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      }),
    );

    const request = new Request("http://localhost:3003/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "wrong" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "upstream_error",
      message: "The server could not be reached.",
    });
  });

  it("passes through Django's JSON refusal body and status unchanged", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ code: "invalid_credentials", message: "Email or password is incorrect." }), {
        status: 403,
      }),
    );

    const request = new Request("http://localhost:3003/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "wrong" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      code: "invalid_credentials",
      message: "Email or password is incorrect.",
    });
  });
});
