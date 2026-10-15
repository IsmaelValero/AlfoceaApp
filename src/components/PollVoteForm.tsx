"use client";

import { useActionState } from "react";

import { FormError, SubmitButton } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import type { PollOption } from "@/lib/types";

export function PollVoteForm({
  action,
  pollId,
  options,
  selectedId,
  peopleCount,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  pollId: string;
  options: PollOption[];
  selectedId?: string;
  peopleCount?: number;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const groups: PollOption[][] = [];
  let bucket: PollOption[] = [];
  for (const option of options) {
    bucket.push(option);
    if (option.label.startsWith("Finde")) {
      groups.push(bucket);
      bucket = [];
    }
  }
  if (bucket.length > 0) groups.push(bucket);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <input type="hidden" name="pollId" value={pollId} />
      <div className="space-y-3">
        {groups.map((group) => (
          <fieldset key={group[0]?.id} className="card space-y-2 px-4 py-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
              {group.find((option) => option.label.startsWith("Finde"))?.label ?? group[0]?.label}
            </legend>
            {group.map((option) => (
              <label key={option.id} className="flex items-center gap-3 text-sm font-medium text-ink">
                <input
                  type="radio"
                  name="optionId"
                  value={option.id}
                  defaultChecked={option.id === selectedId}
                  required
                  className="h-4 w-4 accent-[var(--color-brand)]"
                />
                {option.label}
              </label>
            ))}
          </fieldset>
        ))}
      </div>
      <label className="block text-sm font-semibold text-ink" htmlFor="peopleCount">
        Personas que podéis subir
        <input
          id="peopleCount"
          name="peopleCount"
          type="number"
          min={1}
          required
          inputMode="numeric"
          defaultValue={peopleCount ?? ""}
          className="field mt-1"
        />
      </label>
      <SubmitButton label="Votar por mi familia" />
    </form>
  );
}
