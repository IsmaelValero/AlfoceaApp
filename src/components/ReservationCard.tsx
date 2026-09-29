import Link from "next/link";

import { Badge, type BadgeTone } from "@/components/ui";
import { formatRange, relativeLabel } from "@/lib/dates";
import { formatHours } from "@/lib/hours";
import type { ReservationView } from "@/lib/queries";
import type { ReservationStatus } from "@/lib/types";

export const STATUS_TONE: Record<ReservationStatus, BadgeTone> = {
  confirmada: "brand",
  pendiente: "warn",
  cancelada: "danger",
};

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  confirmada: "Confirmada",
  pendiente: "Pendiente",
  cancelada: "Cancelada",
};

export function ReservationCard({
  reservation,
  showRelative = true,
}: {
  reservation: ReservationView;
  showRelative?: boolean;
}) {
  const { family, member } = reservation;

  return (
    <Link
      href={`/reservas/${reservation.id}`}
      className="card block px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md active:scale-[0.995]"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: family?.color ?? "#9aa8a0" }}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-ink">{reservation.title}</p>
            <Badge tone={STATUS_TONE[reservation.status]}>{STATUS_LABEL[reservation.status]}</Badge>
          </div>

          <p className="mt-0.5 truncate text-sm text-muted">
            {family?.name ?? "Sin familia"}
            {member ? ` - ${member.name}` : ""}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="font-semibold text-ink/75">
              {formatRange(reservation.startDate, reservation.endDate)}
            </span>
            {showRelative ? <span>{relativeLabel(reservation.startDate)}</span> : null}
            <span>{reservation.zone}</span>
            <span>{formatHours(reservation.startTime, reservation.endTime)}</span>
            <span>
              {reservation.guests} {reservation.guests === 1 ? "persona" : "personas"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
