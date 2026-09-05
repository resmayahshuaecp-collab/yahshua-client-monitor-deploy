import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type Context = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, path: string[]) {
  const BACKEND = process.env.BACKEND_ORIGIN ?? "";
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("cm_access")?.value;

  const url = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  // Forward the client's Content-Type so uploads (multipart/form-data) survive.
  const incomingCT = req.headers.get("Content-Type");
  if (incomingCT) headers.set("Content-Type", incomingCT);
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: req.method,
      headers,
      body:
        req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "follow",
      // @ts-expect-error duplex is required for streaming
      duplex: "half",
    });
  } catch {
    return NextResponse.json(
      { error: "Upstream unavailable" },
      { status: 502 },
    );
  }

  // Pass through the backend's real Content-Type and any Set-Cookie headers.
  const resHeaders = new Headers();
  const ct = response.headers.get("Content-Type");
  if (ct) resHeaders.set("Content-Type", ct);
  const setCookie = response.headers.get("Set-Cookie");
  if (setCookie) resHeaders.set("Set-Cookie", setCookie);

  return new NextResponse(response.body, {
    status: response.status,
    headers: resHeaders,
  });
}

export async function GET(req: NextRequest, ctx: Context) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Context) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Context) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Context) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Context) {
  return proxy(req, (await ctx.params).path);
}