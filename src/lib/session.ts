import { cookies } from "next/headers";

import { readSession, SESSION_COOKIE, signSession } from "@/lib/session-token";

const ONE_YEAR = 60 * 60 * 24 * 400;
export const MARK_COOKIE = "alfocea_mark";

export async function getSessionMemberId() {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(memberId: string, mark?: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(memberId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
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
}
