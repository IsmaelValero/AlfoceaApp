"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { text, type FormState } from "@/lib/forms";
import { MEMBER_ROLES, type MemberRole } from "@/lib/types";

function refresh(familyId?: string) {
  revalidatePath("/");
  revalidatePath("/modulos");
  revalidatePath("/familias");
  revalidatePath("/reservas");
  if (familyId) revalidatePath(`/familias/${familyId}`);
}

/* --------------------------------- Familias -------------------------------- */

function parseFamily(formData: FormData) {
  const name = text(formData, "name");
  const color = text(formData, "color");
  const notes = text(formData, "notes");

  if (!name) return { error: "La familia necesita un nombre." };
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return { error: "Elige un color valido." };

  return { data: { name, color, notes: notes || undefined } };
}

export async function createFamily(_prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear familias." };

  const parsed = parseFamily(formData);
  if ("error" in parsed) return { error: parsed.error };

  const created = await db.families.create(parsed.data);
  refresh(created.id);
  redirect(`/familias/${created.id}`);
}

export async function updateFamily(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar familias." };

  const parsed = parseFamily(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.families.update(id, parsed.data);
  if (!updated) return { error: "Esa familia ya no existe." };

  refresh(id);
  redirect(`/familias/${id}`);
}

export async function deleteFamily(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;

  const id = text(formData, "id");

  const reservations = await db.reservations.list();
  if (reservations.some((reservation) => reservation.familyId === id)) {
    redirect(`/familias/${id}?error=reservas`);
  }

  const members = await db.members.list();
  await Promise.all(members.filter((m) => m.familyId === id).map((m) => db.members.remove(m.id)));
  await db.families.remove(id);

  refresh();
  redirect("/familias");
}

/* --------------------------------- Miembros -------------------------------- */

const ROLE_VALUES = MEMBER_ROLES.map((role) => role.value);

function parseMember(formData: FormData) {
  const familyId = text(formData, "familyId");
  const name = text(formData, "name");
  const role = text(formData, "role") as MemberRole;
  const phone = text(formData, "phone");
  const email = text(formData, "email");

  if (!familyId) return { error: "Falta la familia." };
  if (!name) return { error: "El miembro necesita un nombre." };
  if (!ROLE_VALUES.includes(role)) return { error: "Elige un rol." };

  return { data: { familyId, name, role, phone: phone || undefined, email: email || undefined } };
}

export async function createMember(_prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede anadir personas." };

  const parsed = parseMember(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.members.create(parsed.data);
  refresh(parsed.data.familyId);
  redirect(`/familias/${parsed.data.familyId}`);
}

export async function updateMember(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar personas." };

  const parsed = parseMember(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.members.update(id, parsed.data);
  if (!updated) return { error: "Ese miembro ya no existe." };

  refresh(parsed.data.familyId);
  redirect(`/familias/${parsed.data.familyId}`);
}

export async function deleteMember(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;

  const id = text(formData, "id");
  const familyId = text(formData, "familyId");

  const reservations = await db.reservations.list();
  await Promise.all(
    reservations
      .filter((reservation) => reservation.memberId === id)
      .map((reservation) => db.reservations.update(reservation.id, { memberId: undefined })),
  );

  await db.members.remove(id);
  refresh(familyId);
  redirect(`/familias/${familyId}`);
}
