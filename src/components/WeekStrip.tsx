import { fromKey, WEEKDAY_LABELS, type DateKey } from "@/lib/dates";
import type { WeekDay } from "@/lib/queries";

/** Tira de los 7 dias de la semana en curso con un punto por reserva. */
export function WeekStrip({ week, today }: { week: WeekDay[]; today: DateKey }) {
  return (
    <ul className="grid grid-cols-7 gap-1.5">
      {week.map((day, index) => {
        const isToday = day.date === today;
        const busy = day.reservations.length > 0;

        return (
          <li key={day.date}>
            <div
              className={[
                "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition",
                isToday ? "bg-ink text-white" : busy ? "bg-brand-soft text-brand" : "bg-sand text-muted",
              ].join(" ")}
            >
              <span className="text-[0.625rem] font-semibold uppercase tracking-wide opacity-80">
                {WEEKDAY_LABELS[index]}
              </span>
              <span className="text-base font-bold leading-none">{fromKey(day.date).getDate()}</span>

              <span className="flex h-2 items-center gap-0.5">
                {day.reservations.slice(0, 3).map((reservation) => (
                  <span
                    key={reservation.id}
                    className="h-1.5 w-1.5 rounded-full ring-1 ring-white/40"
                    style={{ backgroundColor: reservation.family?.color ?? "#9aa8a0" }}
                    aria-hidden="true"
                  />
                ))}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
