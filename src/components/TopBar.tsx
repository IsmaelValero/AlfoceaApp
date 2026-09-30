import Link from "next/link";

import { BellIcon } from "@/components/icons";
import { SyncMark } from "@/components/SyncMark";
import { findAccountByMember } from "@/lib/accounts";
import { getAdminSession } from "@/lib/authz";
import { unreadAdminRequestCount, unreadDecisionCount } from "@/lib/notifications";
import { getCurrentMember, getHomeData, listReservations } from "@/lib/queries";

/** Cabecera con campana, titulo centrado y acceso al perfil. */
export async function TopBar({ title }: { title: string }) {
  const [home, current, reservations, admin] = await Promise.all([
    getHomeData(),
    getCurrentMember(),
    listReservations(),
    getAdminSession(),
  ]);
  const initial = (current?.member.name ?? "?").slice(0, 1).toUpperCase();

  let lastReadAt: string | undefined;
  let dismissed: string[] = [];
  if (current) {
    try {
      const account = await findAccountByMember(current.member.id);
      lastReadAt = account?.notificationLastReadAt;
      dismissed = account?.dismissedNotificationIds ?? [];
    } catch {
      // Sin columnas de notificaciones aun, la app sigue cargando.
    }
  }

  const alertCount = admin
    ? unreadAdminRequestCount(home.pending, lastReadAt)
    : current
      ? unreadDecisionCount(reservations, current.member.id, dismissed, lastReadAt)
      : 0;

  return (
    <header className="relative mb-6 flex h-11 items-center justify-center">
      <SyncMark mark={initial} />
      <Link
        href="/notificaciones"
        aria-label={alertCount > 0 ? `Notificaciones, ${alertCount} sin leer` : "Notificaciones"}
        className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-2xl transition active:scale-95"
      >
        <BellIcon className="h-7 w-7" />
        {alertCount > 0 ? (
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-canvas" />
        ) : null}
      </Link>
      <h1 className="text-center text-[1.75rem] font-bold leading-none tracking-tight text-ink">{title}</h1>
      <Link
        href="/perfil"
        aria-label="Perfil"
        className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand-dark text-base font-bold text-white"
      >
        {initial}
      </Link>
    </header>
  );
}
