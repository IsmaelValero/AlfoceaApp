"use client";

import { useActionState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { MEMBER_ROLES, type Member } from "@/lib/types";

export function MemberForm({
  action,
  familyId,
  member,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  familyId: string;
  member?: Member;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <input type="hidden" name="familyId" value={familyId} />

      <Field label="Nombre" htmlFor="name">
        <input id="name" name="name" className="field" required maxLength={60} defaultValue={member?.name} />
      </Field>

      <Field label="Rol" htmlFor="role">
        <select id="role" name="role" className="field" defaultValue={member?.role ?? "adulto"}>
          {MEMBER_ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label} - {role.description}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefono" htmlFor="phone" hint="opcional">
          <input id="phone" name="phone" type="tel" className="field" defaultValue={member?.phone} />
        </Field>
        <Field label="Email" htmlFor="email" hint="opcional">
          <input id="email" name="email" type="email" className="field" defaultValue={member?.email} />
        </Field>
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
