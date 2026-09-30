"use client";

import { useEffect, useState } from "react";

import { dismissReservationNotification } from "@/app/notificaciones/actions";
import { Badge, BUTTON_STYLES } from "@/components/ui";
import { daysBetween, formatLong, formatRange, relativeLabel } from "@/lib/dates";
import { formatHours } from "@/lib/hours";
import type { ReservationView } from "@/lib/queries";

export function DecisionNotifications({ items }: { items: ReservationView[] }) {
  const [visible, setVisible] = useState(items);
  const [preview, setPreview] = useState<ReservationView | null>(null);

  useEffect(() => {
    setVisible(items);
  }, [items]);

  async function remove(id: string) {
    setVisible((prev) => prev.filter((item) => item.id !== id));
    if (preview?.id === id) setPreview(null);
    const data = new FormData();
    data.set("id", id);
    await dismissReservationNotification(data);
  }

  if (visible.length === 0) return null;

  return (
    <>
      <section>
        <h2 className="section-title mb-2">Avisos de reserva</h2>
        <ul className="space-y-2.5">
          {visible.map((reservation) => {
            const accepted = reservation.status === "confirmada";
            return (
              <li key={reservation.id}>
                <div
                  className="card flex items-center gap-3 border-l-4 px-4 py-3.5"
                  style={{ borderLeftColor: accepted ? "var(--color-brand)" : "var(--color-danger)" }}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setPreview(reservation)}
                  >
                    <p className="font-semibold text-ink">
                      {accepted ? "Tu reserva ha sido aceptada" : "Tu reserva ha sido rechazada"}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{reservation.title}</p>
                  </button>
                  <button
                    type="button"
                    className="shrink-0 text-sm font-semibold text-muted hover:text-danger"
                    onClick={() => void remove(reservation.id)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {preview ? (
        <ReservationPreview
          reservation={preview}
          onClose={() => {
            const id = preview.id;
            setPreview(null);
            void remove(id);
          }}
        />
      ) : null}
    </>
  );
}

function ReservationPreview({
  reservation,
  onClose,
}: {
  reservation: ReservationView;
  onClose: () => void;
}) {
  const accepted = reservation.status === "confirmada";
  const nights = daysBetween(reservation.startDate, reservation.endDate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <Badge tone={accepted ? "brand" : "danger"}>{accepted ? "Aceptada" : "Rechazada"}</Badge>
            <h2 className="mt-2 text-xl font-bold text-ink">{reservation.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-muted">
            Cerrar
          </button>
        </div>

        <dl className="space-y-2 text-sm">
          <PreviewRow
            label="Cuando"
            value={`${formatRange(reservation.startDate, reservation.endDate)} (${relativeLabel(reservation.startDate)})`}
          />
          <PreviewRow label="Llegada" value={formatLong(reservation.startDate)} />
          <PreviewRow label="Salida" value={formatLong(reservation.endDate)} />
          <PreviewRow label="Duracion" value={nights === 0 ? "Un solo dia" : `${nights + 1} dias`} />
          <PreviewRow label="Horas" value={formatHours(reservation.startTime, reservation.endTime)} />
          <PreviewRow label="Zona" value={reservation.zone} />
          <PreviewRow label="Familia" value={reservation.family?.name ?? "Sin familia"} />
          <PreviewRow label="Personas" value={String(reservation.guests)} />
        </dl>

        <button type="button" onClick={onClose} className={`${BUTTON_STYLES.primary} mt-5 w-full`}>
          Quitar aviso
        </button>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
