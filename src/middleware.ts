import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { readSession, SESSION_COOKIE } from "@/lib/session-token";

function isPublicAsset(pathname: string) {
  if (
    pathname.startsWith("/api/") ||
    pathname === "/salud" ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.png" ||
    pathname === "/icon" ||
    pathname.startsWith("/icon.") ||
    pathname === "/apple-icon" ||
    pathname.startsWith("/apple-icon.") ||
    pathname === "/alfocea-logo.png" ||
    pathname.startsWith("/galeria/")
  ) {
    return true;
  }

  return /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Assets, iconos y diagnostico no pasan por la pantalla de login.
  if (isPublicAsset(pathname)) return NextResponse.next();

  const memberId = await readSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    if (memberId) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!memberId) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Auth en paginas de la app. Se excluyen assets, iconos metadata y la galeria.
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.png|icon(?:\\..*)?|apple-icon(?:\\..*)?|alfocea-logo.png|galeria/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
