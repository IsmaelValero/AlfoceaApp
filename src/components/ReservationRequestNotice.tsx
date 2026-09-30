import Link from "next/link";

import { AdminReservationActions } from "@/components/AdminReservationActions";
import { STATUS_LABEL, STATUS_TONE } from "@/components/ReservationCard";
import { Badge, BUTTON_STYLES } from "@/components/ui";
import { formatRange, relativeLabel } from "@/lib/dates";
import { formatHours } from "@/lib/hours";
import type { ReservationView } from "@/lib/queries";

/** Vista previa de una solicitud pendiente, con aceptar/rechazar para el admin. */
export function ReservationRequestNotice({ reservation }: { reservation: ReservationView }) {
  return (
    <article
      className="card overflow-hidden border-l-4 p-0"
      style={{ borderLeftColor: reservation.family?.color ?? "var(--color-brand-dark)" }}
    >
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-ink">{reservation.title}</p>
            <p className="mt-0.5 text-sm text-muted">
              {reservation.family?.name ?? "Sin familia"}
              {reservation.member ? ` · ${reservation.member.name}` : ""}
            </p>
          </div>
          <Badge tone={STATUS_TONE[reservation.status]}>{STATUS_LABEL[reservation.status]}</Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          <div>
            <dt className="text-muted">Cuando</dt>
            <dd className="font-semibold text-ink">{formatRange(reservation.startDate, reservation.endDate)}</dd>
            <dd className="text-xs text-muted">{relativeLabel(reservation.startDate)}</dd>
          </div>
          <div>
            <dt className="text-muted">Horas</dt>
            <dd className="font-semibold text-ink">{formatHours(reservation.startTime, reservation.endTime)}</dd>
          </div>
          <div>
            <dt className="text-muted">Zona</dt>
            <dd className="font-semibold text-ink">{reservation.zone}</dd>
          </div>
          <div>
            <dt className="text-muted">Personas</dt>
            <dd className="font-semibold text-ink">{reservation.guests}</dd>
          </div>
        </dl>

        <Link href={`/reservas/${reservation.id}`} className={`${BUTTON_STYLES.secondary} w-full`}>
          Previsualizar
        </Link>

        <AdminReservationActions id={reservation.id} nextHref="/notificaciones" />
      </div>
    </article>
  );
}
