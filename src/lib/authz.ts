import { redirect } from "next/navigation";

import { getCurrentMember } from "@/lib/queries";
import { isViewingAsUser } from "@/lib/session";
import type { Member } from "@/lib/types";

/** Rol real en la BBDD (no depende del modo de vista). */
export function hasAdminRole(member: Member | null | undefined) {
  return member?.role === "admin";
}

/** Compat: mismo criterio que el rol real. Preferir hasAdminRole / getAdminSession. */
export function isAdmin(member: Member | null | undefined) {
  return hasAdminRole(member);
}

/** True si el miembro es admin y no esta viendo la app como usuario. */
export async function isActingAsAdmin(member: Member | null | undefined) {
  if (!hasAdminRole(member)) return false;
  return !(await isViewingAsUser());
}

/** Devuelve la sesion solo si el usuario es administrador. */
export async function requireAdmin() {
  const current = await getCurrentMember();
  if (!current) redirect("/login");
  if (!(await isActingAsAdmin(current.member))) redirect("/");
  return current;
}

export async function getAdminSession() {
  const current = await getCurrentMember();
  if (!current || !(await isActingAsAdmin(current.member))) return null;
  return current;
}
