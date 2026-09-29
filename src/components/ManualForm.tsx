"use client";

import { useActionState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { MANUAL_CATEGORIES, type Manual } from "@/lib/types";

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

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
