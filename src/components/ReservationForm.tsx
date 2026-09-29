"use client";

import { useActionState, useState } from "react";

import { FormActions, FormError } from "@/components/form-parts";
import type { FormState } from "@/lib/forms";
import type { FamilyWithMembers } from "@/lib/queries";
import { RESERVATION_STATUSES, RESERVATION_ZONES, type Reservation } from "@/lib/types";

interface ReservationFormProps {
  families: FamilyWithMembers[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  reservation?: Reservation;
  /** Fecha por defecto al crear. Llega del servidor para no desincronizar la hidratacion. */
  defaultDate: string;
  submitLabel: string;
  cancelHref: string;
}

export function ReservationForm({
  families,
  action,
  reservation,
  defaultDate,
  submitLabel,
  cancelHref,
}: ReservationFormProps) {
  const [state, formAction] = useActionState(action, {} as FormState);

  const [familyId, setFamilyId] = useState(reservation?.familyId ?? families[0]?.id ?? "");
  const [startDate, setStartDate] = useState(reservation?.startDate ?? defaultDate);
  const [endDate, setEndDate] = useState(reservation?.endDate ?? defaultDate);

  const members = families.find((family) => family.id === familyId)?.members ?? [];

  // La fecha de fin nunca puede quedar por detras de la de inicio.
  function onStartDateChange(value: string) {
    setStartDate(value);
    if (value > endDate) setEndDate(value);
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />

      <div>
        <label className="field-label" htmlFor="title">
          Titulo
        </label>
        <input
          id="title"
          name="title"
          className="field"
          required
          maxLength={80}
          defaultValue={reservation?.title}
          placeholder="Fin de semana en la casa"
        />
      </div>

      <div>
        <label className="field-label" htmlFor="familyId">
          Familia
        </label>
        <select
          id="familyId"
          name="familyId"
          className="field"
          required
          value={familyId}
          onChange={(event) => setFamilyId(event.target.value)}
        >
          {families.map((family) => (
            <option key={family.id} value={family.id}>
              {family.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="memberId">
          Quien reserva <span className="font-normal">(opcional)</span>
        </label>
        <select
          id="memberId"
          name="memberId"
          className="field"
          defaultValue={reservation?.memberId ?? ""}
          key={familyId}
        >
          <option value="">Sin especificar</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label" htmlFor="zone">
          Zona
        </label>
        <select id="zone" name="zone" className="field" required defaultValue={reservation?.zone ?? RESERVATION_ZONES[0]}>
          {RESERVATION_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="startDate">
            Desde
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            className="field"
            required
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="endDate">
            Hasta
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            className="field"
            required
            min={startDate}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="guests">
            Personas
          </label>
          <input
            id="guests"
            name="guests"
            type="number"
            inputMode="numeric"
            min={1}
            max={99}
            className="field"
            required
            defaultValue={reservation?.guests ?? 2}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="status">
            Estado
          </label>
          <select id="status" name="status" className="field" defaultValue={reservation?.status ?? "pendiente"}>
            {RESERVATION_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="notes">
          Notas <span className="font-normal">(opcional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="field resize-none"
          defaultValue={reservation?.notes}
          placeholder="Llegamos el viernes por la tarde..."
        />
      </div>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
