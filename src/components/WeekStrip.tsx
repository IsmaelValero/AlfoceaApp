"use client";

import Link from "next/link";
import { useState } from "react";

import { fromKey, WEEKDAY_LABELS, type DateKey } from "@/lib/dates";
import { formatHours } from "@/lib/hours";
import type { WeekDay } from "@/lib/queries";

/** Tira de los 7 dias de la semana. Un dia con reserva se abre aqui mismo. */
export function WeekStrip({ week, today }: { week: WeekDay[]; today: DateKey }) {
  const [selected, setSelected] = useState<DateKey | null>(null);
  const day = week.find((item) => item.date === selected) ?? null;

  function choose(date: DateKey) {
    setSelected((current) => (current === date ? null : date));
  }

  return (
    <div>
      <ul className="grid grid-cols-7 gap-1.5">
        {week.map((item, index) => {
          const isToday = item.date === today;
          const busy = item.reservations.length > 0;
          const open = item.date === selected;
          const label = `${WEEKDAY_LABELS[index]} ${fromKey(item.date).getDate()}`;

          const body = (
            <>
              <span className="text-[0.625rem] font-semibold uppercase tracking-wide opacity-80">
                {WEEKDAY_LABELS[index]}
              </span>
              <span className="text-base font-bold leading-none">{fromKey(item.date).getDate()}</span>
              <span className="flex h-2 items-center gap-0.5">
                {item.reservations.slice(0, 3).map((reservation) => (
                  <span
                    key={reservation.id}
                    className="h-1.5 w-1.5 rounded-full ring-1 ring-white/40"
                    style={{ backgroundColor: reservation.family?.color ?? "#9aa8a0" }}
                    aria-hidden="true"
                  />
                ))}
              </span>
            </>
          );

          const className = [
            "flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 transition",
            isToday ? "bg-ink text-white" : busy ? "bg-brand-soft text-brand" : "bg-sand text-muted",
            open ? "ring-2 ring-brand" : "",
          ].join(" ");

          return (
            <li key={item.date}>
              {busy ? (
                <button
                  type="button"
                  className={className}
                  aria-expanded={open}
                  aria-label={open ? `Cerrar ${label}` : `Ver reservas del ${label}`}
                  onClick={() => choose(item.date)}
                >
                  {body}
                </button>
              ) : (
                <div className={className}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {day && day.reservations.length > 0 ? (
        <div className="mt-3 rounded-2xl bg-sand/70 px-3 py-3">
          <ul className="space-y-3">
            {day.reservations.map((reservation) => (
              <li key={reservation.id} className="flex items-start gap-2.5">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: reservation.family?.color ?? "#9aa8a0" }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {reservation.member?.name ?? reservation.family?.name ?? "Sin nombre"}
                  </p>
                  <p className="text-sm text-muted">{reservation.family?.name}</p>
                  <p className="mt-0.5 text-sm font-semibold text-brand">{reservation.zone}</p>
                  <p className="text-sm text-ink">{formatHours(reservation.startTime, reservation.endTime)}</p>
                  {reservation.status === "pendiente" ? (
                    <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">Pendiente</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <Link href={`/reservas?dia=${day.date}`} className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline">
            Ir a Reservas
          </Link>
        </div>
      ) : null}
    </div>
  );
}
