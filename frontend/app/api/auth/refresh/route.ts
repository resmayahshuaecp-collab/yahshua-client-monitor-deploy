import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8085";

type RefreshResponse = {
  access: string;
};

export async function POST() {
  const store = await cookies();
  const refresh = store.get("cm_refresh")?.value;
  if (!refresh) {
    return NextResponse.json({ code: "no_refresh" }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND_ORIGIN}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!upstream.ok) {
    return NextResponse.json({ code: "refresh_failed" }, { status: 401 });
  }

  const { access } = (await upstream.json()) as RefreshResponse;
  const response = NextResponse.json({ ok: true });
  response.cookies.set("cm_access", access, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 30,
  });
  return response;
}
