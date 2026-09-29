import Link from "next/link";

import { ReservationCard } from "@/components/ReservationCard";
import { WeekStrip } from "@/components/WeekStrip";
import { BellIcon, ClockIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { formatRange, relativeLabel } from "@/lib/dates";
import { getHomeData } from "@/lib/queries";

// Los datos viven en disco y cambian al usar la app: nada de cache estatica.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await getHomeData();
  const { stats } = home;

  return (
    <main className="screen">
      <div className="split-pane">
        <div>
      <header className="relative mb-5 flex h-11 items-center justify-center">
        <Link
          href="/notificaciones"
          aria-label={
            home.pending.length > 0
              ? `Notificaciones, ${home.pending.length} sin confirmar`
              : "Notificaciones"
          }
          className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-95"
        >
          <BellIcon className="h-7 w-7" />
          {home.pending.length > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-canvas" />
          ) : null}
        </Link>
        <h1 className="text-center text-[1.75rem] font-bold leading-none tracking-tight text-ink">Alfocea</h1>
        <span
          aria-label="Perfil"
          role="img"
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-base font-bold text-white"
        >
          P
        </span>
      </header>

      {/* Resumen semanal */}
      <section className="card mb-4 p-4">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="font-bold text-ink">Esta semana</h2>
          <Link href="/reservas" className="text-xs font-semibold text-brand hover:underline">
            Ver calendario
          </Link>
        </div>

        <WeekStrip week={home.week} today={home.today} />

        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
          <Stat label="Dias ocupados" value={`${stats.daysOccupiedThisWeek}/7`} />
          <Stat label="Reservas" value={home.weekReservations.length} />
          <Stat label="Personas" value={stats.peopleThisWeek} />
        </dl>
      </section>
        </div>

        <div>
      {/* Hoy */}
      <section className="mb-5">
        <h2 className="section-title mb-2">Hoy en el terreno</h2>
        {home.todayReservations.length > 0 ? (
          <ul className="space-y-2.5">
            {home.todayReservations.map((reservation) => (
              <li key={reservation.id}>
                <ReservationCard reservation={reservation} showRelative={false} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card flex items-center gap-3 px-4 py-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft">
              <ClockIcon className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">Hoy no hay nadie</p>
              <p className="text-sm text-muted">
                {home.nextReservation
                  ? `La proxima visita es ${relativeLabel(home.nextReservation.startDate).toLowerCase()}.`
                  : "Tampoco hay visitas previstas."}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Proxima reserva */}
      {home.nextReservation ? (
        <section className="mb-5">
          <h2 className="section-title mb-2">Proxima reserva</h2>
          <div
            className="card overflow-hidden border-l-4 p-0"
            style={{ borderLeftColor: home.nextReservation.family?.color ?? "#123B52" }}
          >
            <Link href={`/reservas/${home.nextReservation.id}`} className="block px-4 py-4 transition hover:bg-sand/60">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-ink">{home.nextReservation.title}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {home.nextReservation.family?.name} - {home.nextReservation.zone}
                  </p>
                </div>
                <Badge tone="brand">{relativeLabel(home.nextReservation.startDate)}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-brand-dark">
                {formatRange(home.nextReservation.startDate, home.nextReservation.endDate)} -{" "}
                {home.nextReservation.guests} personas
              </p>
            </Link>
          </div>
        </section>
      ) : null}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-xl font-bold text-ink">{value}</dd>
    </div>
  );
}
