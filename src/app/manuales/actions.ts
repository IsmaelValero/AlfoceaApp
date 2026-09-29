"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { text, type FormState } from "@/lib/forms";
import { MANUAL_CATEGORIES, type ManualCategory } from "@/lib/types";

function refresh(id?: string) {
  revalidatePath("/modulos");
  revalidatePath("/manuales");
  if (id) revalidatePath(`/manuales/${id}`);
}

function parseForm(formData: FormData) {
  const title = text(formData, "title");
  const category = text(formData, "category") as ManualCategory;
  const summary = text(formData, "summary");
  const content = text(formData, "content");

  if (!title) return { error: "El manual necesita un titulo." };
  if (!MANUAL_CATEGORIES.includes(category)) return { error: "Elige una categoria." };
  if (!content) return { error: "Escribe el contenido del manual." };

  return {
    data: {
      title,
      category,
      summary: summary || content.split("\n")[0].slice(0, 120),
      content,
      updatedAt: new Date().toISOString(),
    },
  };
}

export async function createManual(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const created = await db.manuals.create(parsed.data);
  refresh(created.id);
  redirect(`/manuales/${created.id}`);
}

export async function updateManual(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.manuals.update(id, parsed.data);
  if (!updated) return { error: "Ese manual ya no existe." };

  refresh(id);
  redirect(`/manuales/${id}`);
}

export async function deleteManual(formData: FormData) {
  await db.manuals.remove(text(formData, "id"));
  refresh();
  redirect("/manuales");
}
