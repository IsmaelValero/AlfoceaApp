import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { readSession, SESSION_COOKIE } from "@/lib/session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const memberId = await readSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (memberId) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!memberId) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|galeria/).*)"],
};
