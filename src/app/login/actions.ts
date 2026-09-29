"use server";

import { redirect } from "next/navigation";

import { findAccountByLogin, saveAccount } from "@/lib/accounts";
import { db } from "@/lib/db";
import { hashPassword, isBootstrapHash, verifyPassword } from "@/lib/passwords";
import { setSessionCookie } from "@/lib/session";
import type { FormState } from "@/lib/forms";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const loginId = text(formData, "username").toLowerCase();
  const password = text(formData, "password");
  const account = loginId ? await findAccountByLogin(loginId) : null;

  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { error: "El usuario o la contraseña no coinciden." };
  }

  if (isBootstrapHash(account.passwordHash)) {
    await saveAccount(account.memberId, { passwordHash: hashPassword(password) });
  }

  const member = await db.members.get(account.memberId);
  await setSessionCookie(account.memberId, member?.name ?? "?");
  redirect("/");
}
