"use client";

import { useActionState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { PROJECT_TASK_STATUSES, type Member, type ProjectTask } from "@/lib/types";

export function ProjectTaskForm({
  action,
  task,
  members,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  task?: ProjectTask;
  members: Member[];
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const selected = new Set(task?.assigneeIds ?? []);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <Field label="Titulo" htmlFor="title">
        <input id="title" name="title" className="field" required maxLength={90} defaultValue={task?.title} />
      </Field>
      <Field label="Descripcion" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={4}
          className="field resize-y"
          defaultValue={task?.description}
        />
      </Field>
      <Field label="Zona" htmlFor="zone" hint="texto libre">
        <input id="zone" name="zone" className="field" maxLength={80} defaultValue={task?.zone} />
      </Field>
      <Field label="Estado" htmlFor="status">
        <select id="status" name="status" className="field" defaultValue={task?.status ?? "sin_comenzar"}>
          {PROJECT_TASK_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="field-label">Asignada a</legend>
        <div className="card max-h-64 space-y-2 overflow-y-auto px-4 py-3">
          {members.map((member) => (
            <label key={member.id} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="assigneeIds"
                value={member.id}
                defaultChecked={selected.has(member.id)}
                className="h-4 w-4 accent-[var(--color-brand)]"
              />
              {member.name}
              {member.lastName ? ` ${member.lastName}` : ""}
            </label>
          ))}
        </div>
      </fieldset>
      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
