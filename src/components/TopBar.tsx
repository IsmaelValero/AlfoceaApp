import Link from "next/link";

import { BellIcon } from "@/components/icons";
import { SyncMark } from "@/components/SyncMark";
import { getCurrentMember, getHomeData } from "@/lib/queries";

/** Cabecera con campana, titulo centrado y acceso al perfil. */
export async function TopBar({ title }: { title: string }) {
  const [home, current] = await Promise.all([getHomeData(), getCurrentMember()]);
  const initial = (current?.member.name ?? "?").slice(0, 1).toUpperCase();

  return (
    <header className="relative mb-6 flex h-11 items-center justify-center">
      <SyncMark mark={initial} />
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
