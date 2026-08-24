import { NextResponse } from "next/server";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8085";

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

type LoginResponse = {
  access: string;
  refresh: string;
  actor: unknown;
};

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await fetch(`${BACKEND_ORIGIN}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const raw = await upstream.text();
  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = null;
  }

  if (!upstream.ok) {
    // Django's refusals are JSON with a `code`. Anything else -- an HTML 500
    // page, an empty body -- must still produce a usable response rather than
    // crashing this handler.
    return NextResponse.json(
      parsed ?? { code: "upstream_error", message: "The server could not be reached." },
      { status: upstream.status },
    );
  }

  const payload = parsed as LoginResponse;
  const response = NextResponse.json({ actor: payload.actor });
  // The tokens stop here. They are never returned to the browser, so no
  // script can read them.
  response.cookies.set("cm_access", payload.access, { ...COOKIE_BASE, maxAge: 60 * 30 });
  response.cookies.set("cm_refresh", payload.refresh, {
    ...COOKIE_BASE,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
