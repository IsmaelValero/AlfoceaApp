"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { text, type FormState } from "@/lib/forms";
import { RULE_CATEGORIES, type RuleCategory, type RulePriority } from "@/lib/types";

const PRIORITIES: RulePriority[] = ["alta", "media", "baja"];

function refresh(id?: string) {
  revalidatePath("/");
  revalidatePath("/modulos");
  revalidatePath("/normas");
  if (id) revalidatePath(`/normas/${id}`);
}

function parseForm(formData: FormData) {
  const title = text(formData, "title");
  const category = text(formData, "category") as RuleCategory;
  const priority = text(formData, "priority") as RulePriority;
  const content = text(formData, "content");

  if (!title) return { error: "La norma necesita un titulo." };
  if (!RULE_CATEGORIES.includes(category)) return { error: "Elige una categoria." };
  if (!PRIORITIES.includes(priority)) return { error: "Elige una prioridad." };
  if (!content) return { error: "Explica en que consiste la norma." };

  return {
    data: {
      title,
      category,
      priority,
      content,
      pinned: formData.get("pinned") === "on",
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function createRule(_prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear normas." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const created = await db.rules.create(parsed.data);
  refresh(created.id);
  redirect(`/normas/${created.id}`);
}

export async function updateRule(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar normas." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.rules.update(id, parsed.data);
  if (!updated) return { error: "Esa norma ya no existe." };

  refresh(id);
  redirect(`/normas/${id}`);
}

export async function toggleRulePinned(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;

  const id = text(formData, "id");
  const rule = await db.rules.get(id);
  if (!rule) return;

  await db.rules.update(id, { pinned: !rule.pinned });
  refresh(id);
}

export async function deleteRule(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;

  await db.rules.remove(text(formData, "id"));
  refresh();
  redirect("/normas");
}
