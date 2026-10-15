"use client";

import { useActionState } from "react";

import { FormError, SubmitButton } from "@/components/form-parts";
import { NumberStepper } from "@/components/NumberStepper";
import type { FormState } from "@/lib/forms";
import type { PollOption } from "@/lib/types";

export function PollVoteForm({
  action,
  pollId,
  options,
  selectedIds,
  adultsCount,
  childrenCount,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  pollId: string;
  options: PollOption[];
  selectedIds?: string[];
  adultsCount?: number;
  childrenCount?: number;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const selected = new Set(selectedIds ?? []);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <input type="hidden" name="pollId" value={pollId} />

      <fieldset className="card space-y-2 px-4 py-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
          Elige uno o más días
        </legend>
        {options.map((option) => (
          <label key={option.id} className="flex items-center gap-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="optionId"
              value={option.id}
              defaultChecked={selected.has(option.id)}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <div className="card space-y-3 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Quiénes podéis subir</p>
        <NumberStepper name="adultsCount" label="Adultos" defaultValue={adultsCount ?? 0} min={0} />
        <NumberStepper name="childrenCount" label="Niños" defaultValue={childrenCount ?? 0} min={0} />
      </div>

      <SubmitButton label="Votar por mi familia" />
    </form>
  );
}
