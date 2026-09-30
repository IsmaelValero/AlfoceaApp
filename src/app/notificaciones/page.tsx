import { DecisionNotifications } from "@/components/DecisionNotifications";
import { MarkNotificationsRead } from "@/components/MarkNotificationsRead";
import { ReservationCard } from "@/components/ReservationCard";
import { ReservationRequestNotice } from "@/components/ReservationRequestNotice";
import { EmptyState, ModuleTitle } from "@/components/ui";
import { findAccountByMember } from "@/lib/accounts";
import { getAdminSession } from "@/lib/authz";
import { visibleDecisionNotifications } from "@/lib/notifications";
import { getCurrentMember, getHomeData, listReservations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const [home, admin, current, reservations] = await Promise.all([
    getHomeData(),
    getAdminSession(),
    getCurrentMember(),
    listReservations(),
  ]);

  const pendingRequests = home.pending;
  const account = current ? await findAccountByMember(current.member.id) : null;
  const dismissed = account?.dismissedNotificationIds ?? [];

  if (admin) {
    const hasAnything = pendingRequests.length > 0 || home.todayReservations.length > 0;

    return (
      <main className="screen">
        <MarkNotificationsRead />
        <ModuleTitle title="Notificaciones" />

        {hasAnything ? (
          <div className="space-y-6">
            {pendingRequests.length > 0 ? (
              <section>
                <h2 className="section-title mb-2">Solicitudes de reserva ({pendingRequests.length})</h2>
                <ul className="space-y-3">
                  {pendingRequests.map((reservation) => (
                    <li key={reservation.id}>
                      <ReservationRequestNotice reservation={reservation} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

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
          </div>
        ) : (
          <EmptyState
            title="No hay solicitudes"
            description="Cuando alguien pida una reserva, te llegara aqui para previsualizarla y aceptarla o rechazarla."
          />
        )}
      </main>
    );
  }

  const memberId = current?.member.id ?? "";
  const decisions = memberId
    ? visibleDecisionNotifications(reservations, memberId, dismissed)
    : [];
  const ownPending = memberId
    ? pendingRequests.filter((reservation) => reservation.memberId === memberId)
    : [];

  const hasAnything = decisions.length > 0 || ownPending.length > 0;

  return (
    <main className="screen">
      <MarkNotificationsRead />
      <ModuleTitle title="Notificaciones" />

      {hasAnything ? (
        <div className="space-y-6">
          <DecisionNotifications items={decisions} />

          {ownPending.length > 0 ? (
            <section>
              <h2 className="section-title mb-2">Tus solicitudes</h2>
              <p className="mb-2 text-sm text-muted">Esperando respuesta del administrador.</p>
              <ul className="space-y-2.5">
                {ownPending.map((reservation) => (
                  <li key={reservation.id}>
                    <ReservationCard reservation={reservation} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No hay avisos"
          description="Cuando te acepten o rechacen una reserva, aparecera aqui."
        />
      )}
    </main>
  );
}
