"use client";

import { useActionState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { RULE_CATEGORIES, type Rule } from "@/lib/types";

const PRIORITY_OPTIONS = [
  { value: "alta", label: "Alta - es importante" },
  { value: "media", label: "Media - conviene cumplirla" },
  { value: "baja", label: "Baja - recomendacion" },
];

export function RuleForm({
  action,
  rule,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  rule?: Rule;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />

      <Field label="Titulo" htmlFor="title">
        <input
          id="title"
          name="title"
          className="field"
          required
          maxLength={90}
          defaultValue={rule?.title}
          placeholder="Quien usa la piscina, la deja limpia"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria" htmlFor="category">
          <select id="category" name="category" className="field" defaultValue={rule?.category ?? RULE_CATEGORIES[0]}>
            {RULE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Prioridad" htmlFor="priority">
          <select id="priority" name="priority" className="field" defaultValue={rule?.priority ?? "media"}>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Contenido" htmlFor="content" hint="empieza una linea con - para crear un punto">
        <textarea
          id="content"
          name="content"
          rows={8}
          className="field resize-y"
          required
          defaultValue={rule?.content}
          placeholder="Explica la norma con tus palabras."
        />
      </Field>

      <label className="card flex cursor-pointer items-start gap-3 px-4 py-3.5">
        <input
          type="checkbox"
          name="pinned"
          defaultChecked={rule?.pinned ?? false}
          className="mt-0.5 h-5 w-5 accent-[var(--color-brand)]"
        />
        <span>
          <span className="block text-sm font-semibold text-ink">Destacar en Inicio</span>
          <span className="block text-sm text-muted">Aparecera en la pantalla principal como recordatorio.</span>
        </span>
      </label>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
