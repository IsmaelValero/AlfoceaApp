"use client";

import { useActionState, useMemo, useState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { MANUAL_CATEGORIES, type Manual, type ManualAttachment } from "@/lib/types";

type PendingFile = { key: string; file: File; preview?: string };

export function ManualForm({
  action,
  manual,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  manual?: Manual;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const [kept, setKept] = useState<ManualAttachment[]>(manual?.attachments ?? []);
  const [pending, setPending] = useState<PendingFile[]>([]);

  const pendingImages = useMemo(() => pending.filter((item) => item.file.type.startsWith("image/")), [pending]);
  const pendingPdfs = useMemo(
    () => pending.filter((item) => item.file.type === "application/pdf" || item.file.name.toLowerCase().endsWith(".pdf")),
    [pending],
  );

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const next: PendingFile[] = [];
    for (const file of Array.from(list)) {
      const key = `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
      const item: PendingFile = { key, file };
      if (file.type.startsWith("image/")) item.preview = URL.createObjectURL(file);
      next.push(item);
    }
    setPending((prev) => [...prev, ...next]);
  }

  function removePending(key: string) {
    setPending((prev) => {
      const target = prev.find((item) => item.key === key);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((item) => item.key !== key);
    });
  }

  function removeKept(id: string) {
    setKept((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <form action={formAction} className="space-y-4" encType="multipart/form-data">
      <FormError message={state.error} />

      <Field label="Titulo" htmlFor="title">
        <input
          id="title"
          name="title"
          className="field"
          required
          maxLength={90}
          defaultValue={manual?.title}
          placeholder="Abrir y cerrar el riego por goteo"
        />
      </Field>

      <Field label="Categoria" htmlFor="category">
        <select id="category" name="category" className="field" defaultValue={manual?.category ?? MANUAL_CATEGORIES[0]}>
          {MANUAL_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Resumen" htmlFor="summary" hint="opcional">
        <input
          id="summary"
          name="summary"
          className="field"
          maxLength={140}
          defaultValue={manual?.summary}
          placeholder="Una linea que explique de que va"
        />
      </Field>

      <Field label="Contenido" htmlFor="content" hint="empieza una linea con - para crear un paso">
        <textarea
          id="content"
          name="content"
          rows={12}
          className="field resize-y font-mono text-sm"
          required
          defaultValue={manual?.content}
          placeholder={"Explicacion general.\n\n- Primer paso\n- Segundo paso"}
        />
      </Field>

      <section className="space-y-3">
        <div>
          <p className="field-label">Fotos y PDFs</p>
          <p className="mt-0.5 text-sm text-muted">Galeria del movil, foto nueva o documentos PDF.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <label className="card flex cursor-pointer flex-col items-center justify-center gap-1 px-2 py-3 text-center text-xs font-semibold text-ink">
            Galeria
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <label className="card flex cursor-pointer flex-col items-center justify-center gap-1 px-2 py-3 text-center text-xs font-semibold text-ink">
            Hacer foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          <label className="card flex cursor-pointer flex-col items-center justify-center gap-1 px-2 py-3 text-center text-xs font-semibold text-ink">
            PDF
            <input
              type="file"
              accept="application/pdf,.pdf"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        {kept.map((item) => (
          <div key={item.id}>
            <input type="hidden" name="keepAttachment" value={item.id} />
            <AttachmentRow
              name={item.name}
              kind={item.kind}
              previewUrl={item.kind === "image" ? item.url : undefined}
              onRemove={() => removeKept(item.id)}
            />
          </div>
        ))}

        {pending.map((item) => (
          <div key={item.key}>
            <input type="file" name="attachments" className="hidden" ref={(node) => assignFileInput(node, item.file)} />
            <AttachmentRow
              name={item.file.name}
              kind={item.file.type === "application/pdf" || item.file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "image"}
              previewUrl={item.preview}
              onRemove={() => removePending(item.key)}
            />
          </div>
        ))}

        {kept.length === 0 && pending.length === 0 ? (
          <p className="text-sm text-muted">Todavia no hay archivos en este manual.</p>
        ) : (
          <p className="text-xs text-muted">
            {kept.length + pending.length} archivo(s)
            {pendingImages.length || pendingPdfs.length
              ? ` · ${pendingImages.length} foto(s) nueva(s)${pendingPdfs.length ? ` · ${pendingPdfs.length} PDF` : ""}`
              : ""}
          </p>
        )}
      </section>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}

function assignFileInput(node: HTMLInputElement | null, file: File) {
  if (!node) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  node.files = transfer.files;
}

function AttachmentRow({
  name,
  kind,
  previewUrl,
  onRemove,
}: {
  name: string;
  kind: "image" | "pdf";
  previewUrl?: string;
  onRemove: () => void;
}) {
  return (
    <div className="card flex items-center gap-3 px-3 py-2.5">
      {kind === "image" && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sand text-xs font-bold text-brand-dark">
          PDF
        </span>
      )}
      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{name}</p>
      <button type="button" onClick={onRemove} className="text-sm font-semibold text-danger">
        Quitar
      </button>
    </div>
  );
}
