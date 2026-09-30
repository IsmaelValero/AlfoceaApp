import { findAccountByMember, saveAccount } from "@/lib/accounts";
import type { ReservationView } from "@/lib/queries";

export function isDecisionNotification(reservation: ReservationView) {
  return reservation.status === "confirmada" || reservation.status === "cancelada";
}

export function visibleDecisionNotifications(
  reservations: ReservationView[],
  memberId: string,
  dismissedIds: string[],
) {
  const dismissed = new Set(dismissedIds);
  return reservations
    .filter(
      (reservation) =>
        reservation.memberId === memberId &&
        isDecisionNotification(reservation) &&
        !dismissed.has(reservation.id),
    )
    .sort((a, b) => (b.resolvedAt ?? b.createdAt).localeCompare(a.resolvedAt ?? a.createdAt));
}

export function unreadDecisionCount(
  reservations: ReservationView[],
  memberId: string,
  dismissedIds: string[],
  lastReadAt?: string,
) {
  return visibleDecisionNotifications(reservations, memberId, dismissedIds).filter((reservation) => {
    const stamp = reservation.resolvedAt ?? reservation.createdAt;
    if (!lastReadAt) return true;
    return stamp > lastReadAt;
  }).length;
}

export function unreadAdminRequestCount(
  pending: ReservationView[],
  lastReadAt?: string,
) {
  if (!lastReadAt) return pending.length;
  return pending.filter((reservation) => reservation.createdAt > lastReadAt).length;
}

export async function markNotificationsRead(memberId: string) {
  try {
    await saveAccount(memberId, { notificationLastReadAt: new Date().toISOString() });
  } catch {
    // Si faltan columnas en Supabase, no bloqueamos la pantalla.
  }
}

export async function dismissNotification(memberId: string, reservationId: string) {
  try {
    const account = await findAccountByMember(memberId);
    if (!account) return;
    const next = Array.from(new Set([...(account.dismissedNotificationIds ?? []), reservationId]));
    await saveAccount(memberId, { dismissedNotificationIds: next });
  } catch {
    // Idem: sin columnas de notificacion, ignoramos el descarte persistente.
  }
}
