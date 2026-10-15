import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Cierra sesión y vuelve al login (útil si la cookie quedó huérfana). */
export async function GET(request: Request) {
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/login", request.url));
}
