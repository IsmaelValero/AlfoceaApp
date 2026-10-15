import Link from "next/link";

import { HomeGallery } from "@/components/HomeGallery";
import { MarkDoneButton } from "@/components/MarkDoneButton";
import { ReservationCard } from "@/components/ReservationCard";
import { TopBar } from "@/components/TopBar";
import { WeekStrip } from "@/components/WeekStrip";
import { Badge, BUTTON_STYLES } from "@/components/ui";
import { formatDayMonth, formatRange, relativeLabel } from "@/lib/dates";
import { monthName } from "@/lib/events";
import { getCurrentMember, getHomeData, listReservations, listWeekTasks, loadEventNotices } from "@/lib/queries";

// Los datos viven en disco y cambian al usar la app: nada de cache estatica.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const current = await getCurrentMember();
  const [home, reservations, weekTasks, events] = await Promise.all([
    getHomeData(),
    listReservations(),
    listWeekTasks(),
    loadEventNotices(current?.family.id),
  ]);
  const { stats } = home;

  const myReservations = current
    ? reservations
        .filter(
          (reservation) =>
            reservation.memberId === current.member.id &&
            reservation.status !== "cancelada" &&
            (reservation.endDate >= home.today || reservation.status === "pendiente"),
        )
        .sort(
          (a, b) =>
            a.startDate.localeCompare(b.startDate) ||
            (a.startTime ?? "").localeCompare(b.startTime ?? "") ||
            0,
        )
    : [];

  return (
    <main className="screen">
      <TopBar title="Alfocea" />

      <HomeGallery />

      <div className="split-pane">
        <div>
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

          {!events.missing && (events.pollOpen || events.pending.length > 0) ? (
            <section className="mb-5">
              <h2 className="section-title mb-2">Eventos</h2>
              <div className="space-y-2.5">
                {events.pollOpen ? (
                  <Link href="/eventos/encuesta" className="card block px-4 py-3.5">
                    <p className="font-semibold text-ink">Encuesta de {monthName(events.month)}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      Elige sábados o domingos de los cumpleaños. Un voto por familia.
                    </p>
                  </Link>
                ) : null}
                {current
                  ? events.pending
                      .filter((event) => event.endDate >= home.today)
                      .map((event) => (
                        <Link key={event.id} href={`/eventos/${event.id}`} className="card block px-4 py-3.5">
                          <p className="font-semibold text-ink">{event.title}</p>
                          <p className="mt-0.5 text-sm text-muted">Falta confirmar si venís.</p>
                        </Link>
                      ))
                  : null}
              </div>
            </section>
          ) : null}

          {weekTasks.length > 0 ? (
            <section className="mb-5">
              <h2 className="section-title mb-2">Tareas de la semana</h2>
              <ul className="space-y-2.5">
                {weekTasks.map((item) => (
                  <li key={`${item.task.id}-${item.date}`} className="card px-4 py-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{formatDayMonth(item.date)}</p>
                    <p className="mt-1 font-semibold text-ink">{item.task.title}</p>
                    {item.task.zone ? <p className="mt-0.5 text-sm text-muted">{item.task.zone}</p> : null}
                    {item.doneBy ? <p className="mt-1 text-sm text-muted">Hecha por {item.doneBy}</p> : null}
                    <div className="mt-3 flex flex-col gap-2">
                      {item.manual ? (
                        <Link href={`/manuales/${item.manual.id}`} className={BUTTON_STYLES.secondary}>
                          Ver instrucciones
                        </Link>
                      ) : null}
                      {item.task.allowDone ? (
                        <MarkDoneButton taskId={item.task.id} date={item.date} done={item.done} />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {myReservations.length > 0 ? (
            <section className="mb-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="section-title">Tus reservas</h2>
                <Link href="/reservas" className="text-xs font-semibold text-brand hover:underline">
                  Ver todas
                </Link>
              </div>
              <ul className="space-y-2.5">
                {myReservations.map((reservation) => (
                  <li key={reservation.id}>
                    <ReservationCard reservation={reservation} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {home.pinnedRules.length > 0 ? (
            <section className="mb-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="section-title">Normas destacadas</h2>
                <Link href="/normas" className="text-xs font-semibold text-brand hover:underline">
                  Ver todas
                </Link>
              </div>
              <ul className="space-y-2">
                {home.pinnedRules.map((rule) => (
                  <li key={rule.id}>
                    <Link href={`/normas/${rule.id}`} className="card block px-4 py-3.5">
                      <p className="font-semibold text-ink">{rule.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{rule.content}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div>
          {home.nextReservation ? (
            <section className="mb-5">
              <h2 className="section-title mb-2">Proxima reserva</h2>
              <div
                className="card overflow-hidden border-l-4 p-0"
                style={{ borderLeftColor: home.nextReservation.family?.color ?? "var(--color-brand-dark)" }}
              >
                <Link href={`/reservas/${home.nextReservation.id}`} className="block px-4 py-4 transition hover:bg-sand/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink">{home.nextReservation.title}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {home.nextReservation.family?.name} - {home.nextReservation.zone}
                      </p>
                    </div>
                    <Badge tone="brand">
                      {home.nextReservation.startDate <= home.today && home.today <= home.nextReservation.endDate
                        ? "Hoy"
                        : relativeLabel(home.nextReservation.startDate, home.today)}
                    </Badge>
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
