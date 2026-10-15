"use client";

import { useActionState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import type { Project } from "@/lib/types";

export function ProjectForm({
  action,
  project,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  project?: Project;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <Field label="Nombre" htmlFor="name">
        <input id="name" name="name" className="field" required maxLength={80} defaultValue={project?.name} />
      </Field>
      <Field label="Descripcion" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={4}
          className="field resize-y"
          defaultValue={project?.description}
        />
      </Field>
      <Field label="Zona" htmlFor="zone" hint="texto libre">
        <input id="zone" name="zone" className="field" maxLength={80} defaultValue={project?.zone} />
      </Field>
      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
