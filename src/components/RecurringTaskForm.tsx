"use client";

import { useActionState, useState } from "react";

import { Field, FormActions, FormError } from "@/components/form-parts";
import { Badge } from "@/components/ui";
import { InfoTip } from "@/components/InfoTip";
import { WEEKDAY_LABELS } from "@/lib/dates";
import type { FormState } from "@/lib/forms";
import type { Manual, RecurringTask } from "@/lib/types";

export function RecurringTaskForm({
  action,
  task,
  manuals,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  task?: RecurringTask;
  manuals: Manual[];
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, {} as FormState);
  const [kind, setKind] = useState(task?.kind ?? "weekly");

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
          defaultValue={task?.title}
          placeholder="Regar o cambiar el filtro"
        />
      </Field>
      <Field label="Zona" htmlFor="zone" hint="opcional">
        <input id="zone" name="zone" className="field" maxLength={80} defaultValue={task?.zone} />
      </Field>
      <Field label="Manual de instrucciones" htmlFor="manualId" hint="opcional">
        <select id="manualId" name="manualId" className="field" defaultValue={task?.manualId ?? ""}>
          <option value="">Sin manual</option>
          {manuals.map((manual) => (
            <option key={manual.id} value={manual.id}>
              {manual.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Se repite" htmlFor="kind">
        <select
          id="kind"
          name="kind"
          className="field"
          value={kind}
          onChange={(event) => setKind(event.target.value as RecurringTask["kind"])}
        >
          <option value="weekly">Cada semana</option>
          <option value="every_other_day">Cada dos días</option>
          <option value="every_n_days">Cada ciertos dias</option>
          <option value="monthly">Cada mes</option>
        </select>
      </Field>

      {kind === "weekly" ? (
        <>
          <fieldset>
            <legend className="field-label">Dias</legend>
            <div className="grid grid-cols-4 gap-2">
              {WEEKDAY_LABELS.map((label, index) => (
                <label key={label} className="card flex items-center justify-center gap-1.5 px-2 py-2 text-sm">
                  <input
                    type="checkbox"
                    name="weekdays"
                    value={index}
                    defaultChecked={task?.weekdays.includes(index) ?? false}
                    className="h-4 w-4 accent-[var(--color-brand)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Cada cuantas semanas" htmlFor="interval">
            <input
              id="interval"
              name="interval"
              type="number"
              min={1}
              max={52}
              className="field"
              defaultValue={task?.kind === "weekly" ? task.interval : 1}
            />
          </Field>
        </>
      ) : null}

      {kind === "every_n_days" ? (
        <Field label="Cada cuantos dias" htmlFor="interval">
          <input
            id="interval"
            name="interval"
            type="number"
            min={1}
            max={365}
            required
            className="field"
            defaultValue={task?.kind === "every_n_days" ? task.interval : 1}
          />
        </Field>
      ) : null}

      {kind === "monthly" ? (
        <Field label="Dia del mes" htmlFor="monthDay">
          <input
            id="monthDay"
            name="monthDay"
            type="number"
            min={1}
            max={31}
            required
            className="field"
            defaultValue={task?.monthDay ?? 1}
          />
        </Field>
      ) : null}

      <p className="flex items-center gap-2 text-sm text-muted">
        <Badge tone="neutral">Sin fecha límite</Badge>
        Se repite siempre, sin un periodo cerrado.
      </p>

      <fieldset className="card px-4 py-3.5">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-ink">
          ¿Marcar como hecho?
          <InfoTip text="Al marcar Sí, indicas que quieres que esta tarea se pueda marcar como hecha." />
        </legend>
        <div className="mt-3 flex gap-4 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="allowDone"
              value="si"
              defaultChecked={task?.allowDone === true}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            Sí
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="allowDone"
              value="no"
              defaultChecked={task?.allowDone !== true}
              className="h-4 w-4 accent-[var(--color-brand)]"
            />
            No
          </label>
        </div>
      </fieldset>

      <FormActions submitLabel={submitLabel} cancelHref={cancelHref} />
    </form>
  );
}
