import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("cm_access");
  response.cookies.delete("cm_refresh");
  return response;
}
