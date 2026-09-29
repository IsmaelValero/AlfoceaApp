import { AdminCreateLink } from "@/components/AdminLinks";
import { Calendar } from "@/components/Calendar";
import { ReservationCard } from "@/components/ReservationCard";
import { ModuleTitle } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { todayKey } from "@/lib/dates";
import { getCurrentMember, listReservations, type ReservationView } from "@/lib/queries";

export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const [reservations, current, admin] = await Promise.all([
    listReservations(),
    getCurrentMember(),
    getAdminSession(),
  ]);
  const today = todayKey();
  const initialDay = dia && DATE_PATTERN.test(dia) ? dia : today;
  const mine = current ? ownUpcoming(reservations, current.member.id, today) : [];
  const pending = admin
    ? reservations.filter((r) => r.status === "pendiente" && r.endDate >= today)
    : [];

  return (
    <main className="screen">
      <ModuleTitle title="Calendario" />
      {admin ? <AdminCreateLink href="/reservas/nueva" label="Nueva reserva" /> : null}

      <Calendar reservations={reservations} today={today} initialDay={initialDay} />

      {pending.length > 0 ? (
        <section className="mt-6">
          <h2 className="section-title mb-2">Pendientes de aceptar</h2>
          <ul className="space-y-2.5">
            {pending.map((reservation) => (
              <li key={reservation.id}>
                <ReservationCard reservation={reservation} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {mine.length > 0 ? (
        <section className="mt-6">
          <h2 className="section-title mb-2">Tus reservas</h2>
          <ul className="space-y-2.5">
            {mine.map((reservation) => (
              <li key={reservation.id}>
                <ReservationCard reservation={reservation} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

/** Pendientes de confirmar, o confirmadas cuyo dia aun no ha llegado. */
function ownUpcoming(reservations: ReservationView[], memberId: string, today: string) {
  return reservations.filter((reservation) => {
    if (reservation.memberId !== memberId) return false;
    if (reservation.status === "pendiente") return reservation.endDate >= today;
    if (reservation.status === "confirmada") return reservation.startDate > today;
    return false;
  });
}
