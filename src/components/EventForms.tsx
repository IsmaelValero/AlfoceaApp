"use client";

import { useActionState } from "react";

import { Field, FormActions, FormError, SubmitButton } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { EVENT_KINDS, RSVP_STATUSES, type RsvpStatus } from "@/lib/types";

export function EventForm({
  action,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <Field label="Nombre" htmlFor="title">
        <input id="title" name="title" className="field" required maxLength={80} placeholder="Navidad en el terreno" />
      </Field>
      <Field label="Tipo" htmlFor="kind">
        <select id="kind" name="kind" className="field" defaultValue="celebracion">
          {EVENT_KINDS.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Desde" htmlFor="startDate">
          <input id="startDate" name="startDate" type="date" className="field" required />
        </Field>
        <Field label="Hasta" htmlFor="endDate" hint="opcional">
          <input id="endDate" name="endDate" type="date" className="field" />
        </Field>
      </div>
      <Field label="Sitio" htmlFor="place" hint="opcional">
        <input id="place" name="place" className="field" maxLength={80} placeholder="Terreno" />
      </Field>
      <Field label="Notas" htmlFor="notes" hint="opcional">
        <textarea id="notes" name="notes" className="field min-h-24" maxLength={500} />
      </Field>
      <FormActions submitLabel="Crear celebración" cancelHref={cancelHref} />
    </form>
  );
}

export function RsvpForm({
  action,
  eventId,
  status,
  peopleCount,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  eventId: string;
  status?: RsvpStatus;
  peopleCount?: number;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state.error} />
      <input type="hidden" name="eventId" value={eventId} />
      <div className="grid grid-cols-1 gap-2">
        {RSVP_STATUSES.map((item) => (
          <label key={item.value} className="flex items-center gap-3 text-sm font-medium text-ink">
            <input
              type="radio"
              name="status"
              value={item.value}
              defaultChecked={item.value === (status ?? "voy")}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            {item.label}
          </label>
        ))}
      </div>
      <label className="block text-sm font-semibold text-ink" htmlFor="peopleCount">
        Cuántos venís
        <input
          id="peopleCount"
          name="peopleCount"
          type="number"
          min={1}
          inputMode="numeric"
          defaultValue={peopleCount && peopleCount > 0 ? peopleCount : ""}
          className="field mt-1"
        />
      </label>
      <SubmitButton label="Guardar por mi familia" />
    </form>
  );
}

export function FoodForm({
  action,
  eventId,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  eventId: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state.error} />
      <input type="hidden" name="eventId" value={eventId} />
      <Field label="Qué llevas" htmlFor="name">
        <input id="name" name="name" className="field" required maxLength={80} placeholder="Tortilla, bebida, postre..." />
      </Field>
      <Field label="Cantidad" htmlFor="quantity">
        <input id="quantity" name="quantity" className="field" required maxLength={40} placeholder="2 bandejas" />
      </Field>
      <SubmitButton label="Apuntar lo que llevo" />
    </form>
  );
}

export function ClosePollForm({
  action,
  pollId,
  options,
  counts,
  leaderId,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  pollId: string;
  options: PollOptionLite[];
  counts: Record<string, number>;
  leaderId?: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state.error} />
      <input type="hidden" name="pollId" value={pollId} />
      <label className="block text-sm font-semibold text-ink" htmlFor="optionId">
        Fecha del cumpleaños
        <select id="optionId" name="optionId" className="field mt-1" defaultValue={leaderId ?? options[0]?.id} required>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} ({counts[option.id] ?? 0} {counts[option.id] === 1 ? "familia" : "familias"})
            </option>
          ))}
        </select>
      </label>
      <SubmitButton label="Cerrar encuesta y crear el evento" />
    </form>
  );
}

interface PollOptionLite {
  id: string;
  label: string;
}
