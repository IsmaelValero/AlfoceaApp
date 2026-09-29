"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BUTTON_STYLES } from "@/components/ui";
import {
  addMonths,
  formatLong,
  formatMonthYear,
  fromKey,
  isSameMonth,
  monthGrid,
  startOfMonth,
  WEEKDAY_LABELS,
  type DateKey,
} from "@/lib/dates";
import { RESERVATION_ZONES } from "@/lib/types";
import { dayHasOpening, formatHours } from "@/lib/hours";
import type { ReservationView } from "@/lib/queries";

interface CalendarProps {
  reservations: ReservationView[];
  today: DateKey;
  /** Dia que debe quedar marcado al abrir, por ejemplo al volver de una solicitud. */
  initialDay?: DateKey;
}

export function Calendar({ reservations, today, initialDay }: CalendarProps) {
  const [month, setMonth] = useState<DateKey>(() => startOfMonth(initialDay ?? today));
  const [selected, setSelected] = useState<DateKey>(initialDay ?? today);

  useEffect(() => {
    if (!initialDay) return;
    setSelected(initialDay);
    setMonth(startOfMonth(initialDay));
  }, [initialDay]);

  // Las canceladas no ocupan el calendario, pero siguen visibles en el listado.
  const active = useMemo(() => reservations.filter((r) => r.status !== "cancelada"), [reservations]);

  const reservationsOn = useMemo(() => {
    const map = new Map<DateKey, ReservationView[]>();
    for (const week of monthGrid(month)) {
      for (const date of week) {
        const matches = active.filter((r) => r.startDate <= date && date <= r.endDate);
        if (matches.length) map.set(date, matches);
      }
    }
    return map;
  }, [active, month]);

  const weeks = useMemo(() => monthGrid(month), [month]);
  const selectedReservations = reservationsOn.get(selected) ?? [];
  const canRequest = dayHasOpening(selectedReservations, RESERVATION_ZONES);

  function goToToday() {
    setMonth(startOfMonth(today));
    setSelected(today);
  }

  return (
    <section className="space-y-4">
      <div className="card overflow-hidden p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <ArrowButton label="Mes anterior" onClick={() => setMonth(addMonths(month, -1))} direction="left" />

          <button
            type="button"
            onClick={goToToday}
            className="rounded-full px-3 py-1 text-sm font-bold capitalize text-ink transition hover:bg-sand"
            title="Volver a hoy"
          >
            {formatMonthYear(month)}
          </button>

          <ArrowButton label="Mes siguiente" onClick={() => setMonth(addMonths(month, 1))} direction="right" />
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1 text-center text-[0.625rem] font-bold uppercase text-muted">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((date) => {
            const dayReservations = reservationsOn.get(date) ?? [];
            const inMonth = isSameMonth(date, month);
            const isToday = date === today;
            const isSelected = date === selected;

            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={isSelected}
                aria-label={formatLong(date)}
                className={[
                  "calendar-day flex aspect-square flex-col items-center justify-center gap-1 rounded-xl text-sm transition",
                  isSelected
                    ? "bg-brand font-bold text-white"
                    : isToday
                      ? "bg-ink font-bold text-white"
                      : inMonth
                        ? "text-ink hover:bg-sand"
                        : "text-muted/40 hover:bg-sand",
                ].join(" ")}
              >
                <span className="leading-none">{fromKey(date).getDate()}</span>
                <span className="flex h-1.5 items-center gap-0.5">
                  {dayReservations.slice(0, 3).map((reservation) => (
                    <span
                      key={reservation.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: reservation.family?.color ?? "#9aa8a0" }}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-bold text-ink">{formatLong(selected)}</h2>

        {selectedReservations.length > 0 ? (
          <ul className="mt-3 divide-y divide-line">
            {selectedReservations.map((reservation) => (
              <li key={reservation.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: reservation.family?.color ?? "#9aa8a0" }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-ink">
                    {reservation.member?.name ?? reservation.family?.name ?? "Sin nombre"}
                  </p>
                  <p className="text-sm text-muted">{reservation.family?.name}</p>
                  <p className="mt-1 text-sm font-semibold text-brand">{reservation.zone}</p>
                  <p className="text-sm text-ink">{formatHours(reservation.startTime, reservation.endTime)}</p>
                  {reservation.status === "pendiente" ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">Pendiente</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Nadie ha reservado este dia.</p>
        )}

        {canRequest ? (
          <Link href={`/reservas/solicitar?dia=${selected}`} className={`${BUTTON_STYLES.primary} mt-4 w-full`}>
            Solicitar reserva
          </Link>
        ) : (
          <p className="mt-4 text-center text-sm font-medium text-muted">No queda hueco este dia.</p>
        )}
      </div>
    </section>
  );
}

function ArrowButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-sand hover:text-ink"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        {direction === "left" ? <path d="m15 6-6 6 6 6" /> : <path d="m9 6 6 6-6 6" />}
      </svg>
    </button>
  );
}
