import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { getSupabase, hasSupabaseEnv } from "@/lib/supabase";
import type { ManualAttachment, ManualAttachmentKind } from "@/lib/types";

export const MANUAL_FILES_BUCKET = "manual-files";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 12;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function extensionFor(file: File, kind: ManualAttachmentKind) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (kind === "pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

function kindFor(file: File): ManualAttachmentKind | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf";
  if (IMAGE_TYPES.has(file.type) || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name)) return "image";
  return null;
}

function asFiles(entries: FormDataEntryValue[]) {
  return entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

export async function uploadManualAttachments(
  manualId: string,
  entries: FormDataEntryValue[],
): Promise<{ attachments: ManualAttachment[]; error?: string }> {
  const files = asFiles(entries);
  if (files.length === 0) return { attachments: [] };
  if (files.length > MAX_FILES) {
    return { attachments: [], error: `Como maximo puedes subir ${MAX_FILES} archivos a la vez.` };
  }

  const attachments: ManualAttachment[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      return { attachments: [], error: `"${file.name}" supera los 8 MB.` };
    }
    const kind = kindFor(file);
    if (!kind) {
      return { attachments: [], error: `"${file.name}" no es una imagen ni un PDF.` };
    }

    const id = randomUUID();
    const ext = extensionFor(file, kind);
    const storagePath = `${manualId}/${id}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (hasSupabaseEnv()) {
      const supabase = getSupabase();
      const { error } = await supabase.storage.from(MANUAL_FILES_BUCKET).upload(storagePath, bytes, {
        contentType: file.type || (kind === "pdf" ? "application/pdf" : "image/jpeg"),
        upsert: false,
      });
      if (error) return { attachments: [], error: `No se pudo subir "${file.name}": ${error.message}` };

      const { data } = supabase.storage.from(MANUAL_FILES_BUCKET).getPublicUrl(storagePath);
      attachments.push({
        id,
        name: file.name || `archivo.${ext}`,
        kind,
        path: storagePath,
        url: data.publicUrl,
      });
    } else {
      const dir = path.join(process.cwd(), "public", "uploads", "manuals", manualId);
      await fs.mkdir(dir, { recursive: true });
      const filename = `${id}.${ext}`;
      await fs.writeFile(path.join(dir, filename), bytes);
      attachments.push({
        id,
        name: file.name || filename,
        kind,
        path: `uploads/manuals/${manualId}/${filename}`,
        url: `/uploads/manuals/${manualId}/${filename}`,
      });
    }
  }

  return { attachments };
}

export async function deleteManualAttachments(attachments: ManualAttachment[]) {
  if (attachments.length === 0) return;

  if (hasSupabaseEnv()) {
    const paths = attachments.map((item) => item.path).filter(Boolean);
    if (paths.length === 0) return;
    await getSupabase().storage.from(MANUAL_FILES_BUCKET).remove(paths);
    return;
  }

  await Promise.all(
    attachments.map(async (item) => {
      try {
        await fs.unlink(path.join(process.cwd(), "public", item.path));
      } catch {
        // Si ya no esta, seguimos.
      }
    }),
  );
}
