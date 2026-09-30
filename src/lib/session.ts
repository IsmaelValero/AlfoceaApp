import { cookies } from "next/headers";

import { readSession, SESSION_COOKIE, signSession } from "@/lib/session-token";

const ONE_YEAR = 60 * 60 * 24 * 400;
export const MARK_COOKIE = "alfocea_mark";
/** Si vale "user", un admin real usa la app como usuario normal. */
export const VIEW_MODE_COOKIE = "alfocea_view";

export async function getSessionMemberId() {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}

export async function isViewingAsUser() {
  const jar = await cookies();
  return jar.get(VIEW_MODE_COOKIE)?.value === "user";
}

export async function setViewAsUser(enabled: boolean) {
  const jar = await cookies();
  if (enabled) {
    jar.set(VIEW_MODE_COOKIE, "user", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR,
    });
  } else {
    jar.delete(VIEW_MODE_COOKIE);
  }
}

export async function setSessionCookie(memberId: string, mark?: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(memberId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  // Al iniciar sesion, siempre modo admin real (si aplica).
  jar.delete(VIEW_MODE_COOKIE);
  if (mark) {
    jar.set(MARK_COOKIE, mark.slice(0, 1).toUpperCase(), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(MARK_COOKIE);
  jar.delete(VIEW_MODE_COOKIE);
}
