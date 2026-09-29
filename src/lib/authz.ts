import { redirect } from "next/navigation";

import { getCurrentMember } from "@/lib/queries";
import type { Member } from "@/lib/types";

export function isAdmin(member: Member | null | undefined) {
  return member?.role === "admin";
}

/** Devuelve la sesion solo si el usuario es administrador. */
export async function requireAdmin() {
  const current = await getCurrentMember();
  if (!current) redirect("/login");
  if (!isAdmin(current.member)) redirect("/");
  return current;
}

export async function getAdminSession() {
  const current = await getCurrentMember();
  if (!current || !isAdmin(current.member)) return null;
  return current;
}
