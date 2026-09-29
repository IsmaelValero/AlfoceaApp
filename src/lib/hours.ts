/** Franja en la que se puede pedir una reserva. */
export const DAY_OPEN = "08:00";
export const DAY_CLOSE = "22:00";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isTime(value: string): boolean {
  return TIME_PATTERN.test(value);
}

export function toMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/** "11:00 - 14:00", o el dia entero si la reserva no tiene horas. */
export function formatHours(startTime?: string, endTime?: string): string {
  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return "Todo el dia";
}

/** Dos franjas del mismo dia se pisan. Sin hora, cuenta como el dia completo. */
export function timesOverlap(
  aStart?: string,
  aEnd?: string,
  bStart?: string,
  bEnd?: string,
): boolean {
  const startA = toMinutes(aStart && isTime(aStart) ? aStart : "00:00");
  const endA = toMinutes(aEnd && isTime(aEnd) ? aEnd : "23:59");
  const startB = toMinutes(bStart && isTime(bStart) ? bStart : "00:00");
  const endB = toMinutes(bEnd && isTime(bEnd) ? bEnd : "23:59");
  return startA < endB && startB < endA;
}

interface Timed {
  zone: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Hay hueco si alguna zona deja algun minuto libre entre la apertura y el cierre.
 * Una reserva sin hora tapa esa zona el dia entero.
 */
export function dayHasOpening(reservations: Timed[], zones: readonly string[]): boolean {
  return zones.some((zone) => zoneHasGap(reservations.filter((reservation) => reservation.zone === zone)));
}

function zoneHasGap(reservations: Timed[]): boolean {
  const open = toMinutes(DAY_OPEN);
  const close = toMinutes(DAY_CLOSE);
  const blocks = reservations
    .map((reservation) => {
      const start = toMinutes(reservation.startTime && isTime(reservation.startTime) ? reservation.startTime : "00:00");
      const end = toMinutes(reservation.endTime && isTime(reservation.endTime) ? reservation.endTime : "23:59");
      return [Math.max(start, open), Math.min(end, close)] as const;
    })
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);

  let cursor = open;
  for (const [start, end] of blocks) {
    if (start > cursor) return true;
    cursor = Math.max(cursor, end);
  }
  return cursor < close;
}
