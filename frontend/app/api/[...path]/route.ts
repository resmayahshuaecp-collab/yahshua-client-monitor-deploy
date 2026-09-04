import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "";

async function proxy(req: NextRequest, path: string[]) {
  const url = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`;
  const headers = new Headers(req.headers);
  headers.delete("host");

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error duplex is required for streaming
    duplex: "half",
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: new Headers(response.headers),
  });
}

type Context = { params: Promise<{ path: string[] }> };

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