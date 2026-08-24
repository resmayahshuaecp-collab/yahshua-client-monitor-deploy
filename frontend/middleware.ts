import { NextResponse, type NextRequest } from "next/server";

// A cheap presence check only. The cookie is not verified here -- Django
// does that on every call. This exists so an unauthenticated visitor lands
// on /login instead of on a dashboard that flashes and then errors.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("cm_access") || request.cookies.has("cm_refresh");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
