import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "https://yahshua-client-monitor-deploy-lrp5-sigma.vercel.app";
console.log("BACKEND_URL at load time:", BACKEND);

async function proxy(req: NextRequest, path: string[]) {
  const backendUrl = process.env.BACKEND_URL ?? "";
  console.log("BACKEND_URL at request time:", backendUrl);
  
  const url = `${backendUrl}/api/${path.join("/")}${req.nextUrl.search}`;
  console.log("Proxying to:", url);
  
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