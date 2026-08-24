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

  it("sets httpOnly cookies and never exposes the tokens in the body", async () => {
    // This is the design's central security property (spec §3.3 step 5):
    // access/refresh must never reach browser JS. A one-line regression --
    // returning payload.access/refresh directly, or dropping httpOnly --
    // must fail this test.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access: "access-token-value",
          refresh: "refresh-token-value",
          actor: { user_id: 1, email: "admin@example.com", name: "Ada A.", role: "ADMIN" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const request = new Request("http://localhost:3003/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@example.com", password: "pw-12345678" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.actor).toEqual({
      user_id: 1,
      email: "admin@example.com",
      name: "Ada A.",
      role: "ADMIN",
    });
    expect(body).not.toHaveProperty("access");
    expect(body).not.toHaveProperty("refresh");

    const access = response.cookies.get("cm_access");
    const refresh = response.cookies.get("cm_refresh");
    expect(access?.value).toBe("access-token-value");
    expect(access?.httpOnly).toBe(true);
    expect(refresh?.value).toBe("refresh-token-value");
    expect(refresh?.httpOnly).toBe(true);
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
