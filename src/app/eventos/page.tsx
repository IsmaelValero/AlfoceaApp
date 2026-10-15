import Link from "next/link";

import { AdminCreateLink } from "@/components/AdminLinks";
import { Badge, EmptyState, ModuleTitle } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { formatRange, todayKey } from "@/lib/dates";
import { monthName } from "@/lib/events";
import { loadEventBoard } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [board, admin] = await Promise.all([loadEventBoard({ ensurePoll: true }), getAdminSession()]);

  if (board.missing) {
    return (
      <main className="screen">
        <ModuleTitle title="Eventos" />
        <EmptyState
          title="Falta preparar la base de datos"
          description="Ejecuta supabase/events.sql en el SQL Editor de Supabase y vuelve a cargar."
        />
      </main>
    );
  }

  const poll = board.polls.find((item) => item.month === board.month);
  const today = todayKey();
  const upcoming = board.events
    .filter((event) => event.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = board.events
    .filter((event) => event.endDate < today)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  return (
    <main className="screen">
      <ModuleTitle title="Eventos" />
      {admin ? <AdminCreateLink href="/eventos/nuevo" label="Nueva celebración" /> : null}

      {poll?.status === "abierta" ? (
        <Link href="/eventos/encuesta" className="card mb-5 block px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">Encuesta abierta</p>
          <p className="mt-1 font-semibold text-ink">Cumpleaños de {monthName(board.month)}</p>
          <p className="mt-1 text-sm text-muted">Una persona por familia elige el finde y cuántos podéis subir.</p>
        </Link>
      ) : null}

      <section className="mb-8">
        <h2 className="section-title mb-2">Próximos</h2>
        {upcoming.length > 0 ? (
          <ul className="space-y-2.5">
            {upcoming.map((event) => (
              <li key={event.id}>
                <Link href={`/eventos/${event.id}`} className="card block px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{event.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{formatRange(event.startDate, event.endDate)}</p>
                      {event.place ? <p className="mt-0.5 text-sm text-muted">{event.place}</p> : null}
                    </div>
                    <Badge tone="brand">{comingCount(board.rsvps, event.id)} pers.</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="No hay celebraciones por delante" description="La encuesta del mes y las fiestas aparecerán aquí." />
        )}
      </section>

      {past.length > 0 ? (
        <section>
          <h2 className="section-title mb-2">Ya pasados</h2>
          <ul className="space-y-2">
            {past.slice(0, 6).map((event) => (
              <li key={event.id}>
                <Link href={`/eventos/${event.id}`} className="card block px-4 py-3 text-sm text-muted">
                  <span className="font-semibold text-ink">{event.title}</span>
                  <span className="mt-0.5 block">{formatRange(event.startDate, event.endDate)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function comingCount(rsvps: { eventId: string; status: string; peopleCount: number }[], eventId: string) {
  return rsvps
    .filter((rsvp) => rsvp.eventId === eventId && rsvp.status === "voy")
    .reduce((sum, rsvp) => sum + rsvp.peopleCount, 0);
}
