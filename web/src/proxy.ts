import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? "message_app_token";

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

  if (!authCookie) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/users/:path*",
    "/conversations/:path*"
  ]
};
