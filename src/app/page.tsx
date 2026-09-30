import Link from "next/link";

import { HomeGallery } from "@/components/HomeGallery";
import { ReservationCard } from "@/components/ReservationCard";
import { TopBar } from "@/components/TopBar";
import { WeekStrip } from "@/components/WeekStrip";
import { Badge } from "@/components/ui";
import { formatRange, relativeLabel } from "@/lib/dates";
import { getCurrentMember, getHomeData, listReservations } from "@/lib/queries";

// Los datos viven en disco y cambian al usar la app: nada de cache estatica.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [home, current, reservations] = await Promise.all([
    getHomeData(),
    getCurrentMember(),
    listReservations(),
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
