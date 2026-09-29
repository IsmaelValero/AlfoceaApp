import Link from "next/link";

import { ReservationCard } from "@/components/ReservationCard";
import { EmptyState } from "@/components/ui";
import { getHomeData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const home = await getHomeData();
  const hasAnything = home.todayReservations.length > 0 || home.pending.length > 0 || home.nextReservation;

  return (
    <main className="screen">
      <header className="mb-6 text-center">
        <p className="section-title">Alfocea</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink">Notificaciones</h1>
      </header>

      {hasAnything ? (
        <div className="space-y-6">
          {home.todayReservations.length > 0 ? (
            <section>
              <h2 className="section-title mb-2">Hoy en el terreno</h2>
              <ul className="space-y-2.5">
                {home.todayReservations.map((reservation) => (
                  <li key={reservation.id}>
                    <ReservationCard reservation={reservation} showRelative={false} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {home.pending.length > 0 ? (
            <section>
              <h2 className="section-title mb-2">Sin confirmar</h2>
              <ul className="space-y-2.5">
                {home.pending.map((reservation) => (
                  <li key={reservation.id}>
                    <ReservationCard reservation={reservation} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {home.nextReservation && home.nextReservation.startDate > home.today ? (
            <section>
              <h2 className="section-title mb-2">Proxima visita</h2>
              <Link href={`/reservas/${home.nextReservation.id}`} className="card block px-4 py-4">
                <p className="font-semibold text-ink">{home.nextReservation.title}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {home.nextReservation.family?.name} - {home.nextReservation.zone}
                </p>
              </Link>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState title="No hay avisos" description="Cuando haya una visita o algo pendiente, aparecera aqui." />
      )}
    </main>
  );
}
