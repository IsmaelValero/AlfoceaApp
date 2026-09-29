"use client";

import { useActionState, useState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import { DAY_CLOSE, DAY_OPEN } from "@/lib/hours";
import { RESERVATION_ZONES } from "@/lib/types";

export function RequestReservationForm({
  action,
  day,
  dayLabel,
  memberName,
  familyName,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  day: string;
  dayLabel: string;
  memberName: string;
  familyName: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");
  const [guests, setGuests] = useState("2");
  const [eventType, setEventType] = useState("");
  const [zone, setZone] = useState<(typeof RESERVATION_ZONES)[number]>(RESERVATION_ZONES[0]);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />
      <input type="hidden" name="day" value={day} />

      <div className="card space-y-3 p-4">
        <div>
          <p className="field-label">Dia</p>
          <p className="font-semibold text-ink">{dayLabel}</p>
        </div>
        <div>
          <p className="field-label">Quien reserva</p>
          <p className="font-semibold text-ink">{memberName}</p>
          <p className="text-sm text-muted">{familyName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Desde" htmlFor="startTime">
          <input
            id="startTime"
            name="startTime"
            type="time"
            className="field"
            required
            min={DAY_OPEN}
            max={DAY_CLOSE}
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </Field>
        <Field label="Hasta" htmlFor="endTime">
          <input
            id="endTime"
            name="endTime"
            type="time"
            className="field"
            required
            min={DAY_OPEN}
            max={DAY_CLOSE}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </Field>
      </div>

      <Field label="Personas" htmlFor="guests">
        <input
          id="guests"
          name="guests"
          type="number"
          inputMode="numeric"
          min={1}
          max={99}
          className="field"
          required
          value={guests}
          onChange={(event) => setGuests(event.target.value)}
        />
      </Field>

      <Field label="Tipo de evento" htmlFor="eventType">
        <input
          id="eventType"
          name="eventType"
          className="field"
          required
          maxLength={80}
          placeholder="Comida, cumpleaños, baño..."
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
        />
      </Field>

      <Field label="Zona" htmlFor="zone">
        <select id="zone" name="zone" className="field" required value={zone} onChange={(event) => setZone(event.target.value as (typeof RESERVATION_ZONES)[number])}>
          {RESERVATION_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </Field>

      <FormActions submitLabel="Enviar solicitud" cancelHref={`/reservas?dia=${day}`} />
    </form>
  );
}
