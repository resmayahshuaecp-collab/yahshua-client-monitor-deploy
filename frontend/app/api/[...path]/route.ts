import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type Context = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, path: string[]) {
  const BACKEND = process.env.BACKEND_ORIGIN ?? "";
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("cm_access")?.value;
  
  const joined = path.join("/");
const url = `${BACKEND}/api/${joined}${joined.endsWith("/") ? "" : "/"}${req.nextUrl.search}`;
  
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error duplex is required for streaming
    duplex: "half",
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: { "Content-Type": "application/json" },
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