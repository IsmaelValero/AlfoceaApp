/**
 * Utilidades de fecha para claves "YYYY-MM-DD".
 *
 * Todo se trabaja en hora local y sin componente horario: una reserva del dia 4
 * es el dia 4 independientemente de la zona horaria del navegador.
 */

export type DateKey = string; // "YYYY-MM-DD"

const MS_PER_DAY = 86_400_000;

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

export const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Convierte un Date local a clave "YYYY-MM-DD". */
export function toKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Convierte "YYYY-MM-DD" a un Date local a mediodia. */
export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function addDays(key: DateKey, days: number): DateKey {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

/** Diferencia en dias completos entre dos claves (b - a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / MS_PER_DAY);
}

/** Lunes de la semana a la que pertenece la clave. */
export function startOfWeek(key: DateKey): DateKey {
  const date = fromKey(key);
  const dow = (date.getDay() + 6) % 7; // 0 = lunes
  return addDays(key, -dow);
}

export function endOfWeek(key: DateKey): DateKey {
  return addDays(startOfWeek(key), 6);
}

export function startOfMonth(key: DateKey): DateKey {
  const date = fromKey(key);
  return toKey(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function addMonths(key: DateKey, months: number): DateKey {
  const date = fromKey(key);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return toKey(target);
}

/** Todas las claves del rango, inclusivas por ambos extremos. */
export function eachDay(start: DateKey, end: DateKey): DateKey[] {
  const out: DateKey[] = [];
  let cursor = start;
  // Guarda de seguridad frente a rangos invertidos o corruptos.
  for (let i = 0; i <= 366 && cursor <= end; i++) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** Dos rangos inclusivos se solapan. */
export function rangesOverlap(aStart: DateKey, aEnd: DateKey, bStart: DateKey, bEnd: DateKey): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/**
 * Rejilla del mes: siempre 6 semanas de 7 dias empezando en lunes,
 * para que la altura del calendario no salte al cambiar de mes.
 */
export function monthGrid(key: DateKey): DateKey[][] {
  const first = startOfMonth(key);
  const gridStart = startOfWeek(first);
  const weeks: DateKey[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: DateKey[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(addDays(gridStart, w * 7 + d));
    }
    weeks.push(week);
  }
  return weeks;
}

export function isSameMonth(a: DateKey, b: DateKey): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/* --------------------------------- Formato --------------------------------- */

/** "4 de septiembre" */
export function formatDayMonth(key: DateKey): string {
  const date = fromKey(key);
  return `${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;
}

/** "Lunes, 4 de septiembre de 2026" */
export function formatLong(key: DateKey): string {
  const date = fromKey(key);
  const weekday = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"][date.getDay()];
  return `${weekday}, ${date.getDate()} de ${MONTH_LABELS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** "septiembre 2026" */
export function formatMonthYear(key: DateKey): string {
  const date = fromKey(key);
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "4 sep" o "4 - 7 sep" o "30 ago - 2 sep" */
export function formatRange(start: DateKey, end: DateKey): string {
  const a = fromKey(start);
  const b = fromKey(end);
  const shortMonth = (d: Date) => MONTH_LABELS[d.getMonth()].slice(0, 3);
  if (start === end) return `${a.getDate()} ${shortMonth(a)}`;
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} - ${b.getDate()} ${shortMonth(b)}`;
  return `${a.getDate()} ${shortMonth(a)} - ${b.getDate()} ${shortMonth(b)}`;
}

/** "Hoy", "Manana", "En 3 dias", "Hace 2 dias" */
export function relativeLabel(key: DateKey, reference: DateKey = todayKey()): string {
  const diff = daysBetween(reference, key);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  if (diff > 1) return `En ${diff} dias`;
  return `Hace ${Math.abs(diff)} dias`;
}
