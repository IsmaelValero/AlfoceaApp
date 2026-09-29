"use server";

import { redirect } from "next/navigation";

import { findAccountByEmail, findAccountByMember, saveAccount } from "@/lib/accounts";
import { db } from "@/lib/db";
import { text, type FormState } from "@/lib/forms";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { clearSessionCookie, getSessionMemberId } from "@/lib/session";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function currentAccount() {
  const memberId = await getSessionMemberId();
  if (!memberId) return null;
  const account = await findAccountByMember(memberId);
  if (!account) return null;
  return account;
}

export async function updateEmail(_prev: FormState, formData: FormData): Promise<FormState> {
  const account = await currentAccount();
  if (!account) return { error: "La sesion ha caducado." };

  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "currentPassword");

  if (!EMAIL_PATTERN.test(email)) return { error: "Escribe un correo valido." };
  if (!verifyPassword(password, account.passwordHash)) return { error: "La contraseña actual no coincide." };

  const taken = await findAccountByEmail(email);
  if (taken && taken.memberId !== account.memberId) return { error: "Ese correo ya esta en uso." };

  await saveAccount(account.memberId, { email });
  await db.members.update(account.memberId, { email });
  return { message: "Correo actualizado." };
}

export async function updatePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const account = await currentAccount();
  if (!account) return { error: "La sesion ha caducado." };

  const currentPassword = text(formData, "currentPassword");
  const nextPassword = text(formData, "nextPassword");
  const confirmPassword = text(formData, "confirmPassword");

  if (!verifyPassword(currentPassword, account.passwordHash)) return { error: "La contraseña actual no coincide." };
  if (nextPassword.length < 6) return { error: "La nueva contraseña necesita al menos 6 caracteres." };
  if (nextPassword !== confirmPassword) return { error: "Las contraseñas nuevas no coinciden." };

  await saveAccount(account.memberId, { passwordHash: hashPassword(nextPassword) });
  return { message: "Contraseña actualizada." };
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
