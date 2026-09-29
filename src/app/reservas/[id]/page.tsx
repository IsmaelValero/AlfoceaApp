import { notFound } from "next/navigation";

import { STATUS_LABEL, STATUS_TONE } from "@/components/ReservationCard";
import { Badge, BackLink } from "@/components/ui";
import { daysBetween, formatLong, relativeLabel } from "@/lib/dates";
import { formatHours } from "@/lib/hours";
import { getReservation } from "@/lib/queries";
import { MEMBER_ROLES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await getReservation(id);

  if (!reservation) notFound();

  const nights = daysBetween(reservation.startDate, reservation.endDate);
  const roleLabel = reservation.member
    ? MEMBER_ROLES.find((role) => role.value === reservation.member?.role)?.label
    : null;

  return (
    <main className="screen">
      <BackLink href="/reservas" label="Reservas" />

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge tone={STATUS_TONE[reservation.status]}>{STATUS_LABEL[reservation.status]}</Badge>
          <Badge tone="neutral">{reservation.zone}</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{reservation.title}</h1>
        <p className="mt-1 text-sm text-muted">{relativeLabel(reservation.startDate)}</p>
      </header>

      {/* Fechas */}
      <section
        className="card mb-4 border-l-4 p-4"
        style={{ borderLeftColor: reservation.family?.color ?? "#123B52" }}
      >
        <Row label="Llegada" value={formatLong(reservation.startDate)} />
        <Row label="Salida" value={formatLong(reservation.endDate)} />
        <Row
          label="Duracion"
          value={nights === 0 ? "Un solo dia" : `${nights + 1} dias (${nights} ${nights === 1 ? "noche" : "noches"})`}
        />
        <Row label="Horas" value={formatHours(reservation.startTime, reservation.endTime)} />
      </section>

      {/* Quien viene */}
      <section className="card mb-4 p-4">
        <Row
          label="Familia"
          value={
            <span className="inline-flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: reservation.family?.color ?? "#9aa8a0" }}
                aria-hidden="true"
              />
              {reservation.family?.name ?? "Sin familia"}
            </span>
          }
        />
        <Row
          label="Reserva"
          value={reservation.member ? `${reservation.member.name}${roleLabel ? ` (${roleLabel})` : ""}` : "Sin especificar"}
        />
        <Row label="Personas" value={`${reservation.guests}`} />
      </section>

      {reservation.notes ? (
        <section className="card p-4">
          <p className="section-title mb-2">Notas</p>
          <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink/85">{reservation.notes}</p>
        </section>
      ) : null}
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0 last:pb-0 first:pt-0">
      <span className="shrink-0 text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
