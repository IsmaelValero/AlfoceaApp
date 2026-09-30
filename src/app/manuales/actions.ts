"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { text, type FormState } from "@/lib/forms";
import { deleteManualAttachments, uploadManualAttachments } from "@/lib/manual-storage";
import { MANUAL_CATEGORIES, type ManualAttachment, type ManualCategory } from "@/lib/types";

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

function keptAttachments(formData: FormData, current: ManualAttachment[]) {
  const keep = new Set(formData.getAll("keepAttachment").map(String));
  return current.filter((item) => keep.has(item.id));
}

export async function createManual(_prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear manuales." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const created = await db.manuals.create({ ...parsed.data, attachments: [] });
  const uploaded = await uploadManualAttachments(created.id, formData.getAll("attachments"));
  if (uploaded.error) {
    await db.manuals.remove(created.id);
    return { error: uploaded.error };
  }

  if (uploaded.attachments.length > 0) {
    await db.manuals.update(created.id, { attachments: uploaded.attachments });
  }

  refresh(created.id);
  redirect(`/manuales/${created.id}`);
}

export async function updateManual(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar manuales." };

  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const current = await db.manuals.get(id);
  if (!current) return { error: "Ese manual ya no existe." };

  const kept = keptAttachments(formData, current.attachments ?? []);
  const uploaded = await uploadManualAttachments(id, formData.getAll("attachments"));
  if (uploaded.error) return { error: uploaded.error };

  const removed = (current.attachments ?? []).filter((item) => !kept.some((keep) => keep.id === item.id));
  await deleteManualAttachments(removed);

  const attachments: ManualAttachment[] = [...kept, ...uploaded.attachments];
  const updated = await db.manuals.update(id, { ...parsed.data, attachments });
  if (!updated) return { error: "Ese manual ya no existe." };

  refresh(id);
  redirect(`/manuales/${id}`);
}

export async function deleteManual(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;

  const id = text(formData, "id");
  const manual = await db.manuals.get(id);
  if (manual?.attachments?.length) {
    await deleteManualAttachments(manual.attachments);
  }

  await db.manuals.remove(id);
  refresh();
  redirect("/manuales");
}
