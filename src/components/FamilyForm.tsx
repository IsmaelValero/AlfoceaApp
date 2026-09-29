"use client";

import { useActionState, useState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { FAMILY_COLORS, type Family } from "@/lib/types";

export function FamilyForm({
  action,
  family,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  family?: Family;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const [color, setColor] = useState<string>(family?.color ?? FAMILY_COLORS[0]);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />

      <Field label="Nombre de la rama familiar" htmlFor="name">
        <input
          id="name"
          name="name"
          className="field"
          required
          maxLength={60}
          defaultValue={family?.name}
          placeholder="Los de Zaragoza"
        />
      </Field>

      <fieldset>
        <legend className="field-label">Color en el calendario</legend>
        <input type="hidden" name="color" value={color} />
        <div className="flex flex-wrap gap-2.5">
          {FAMILY_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              aria-label={`Color ${option}`}
              aria-pressed={color === option}
              className={[
                "h-10 w-10 rounded-full transition",
                color === option ? "ring-2 ring-ink ring-offset-2 ring-offset-sand" : "hover:scale-105",
              ].join(" ")}
              style={{ backgroundColor: option }}
            />
          ))}
        </div>
      </fieldset>

      <Field label="Notas" htmlFor="notes" hint="opcional">
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="field resize-none"
          defaultValue={family?.notes}
          placeholder="Suelen venir en puentes y vacaciones."
        />
      </Field>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
