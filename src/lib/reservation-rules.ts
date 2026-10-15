import { addDays, fromKey, toKey, type DateKey } from "@/lib/dates";
import { isTime, toMinutes } from "@/lib/hours";

/** Franja roja: de las 12:00 hasta las 19:30. A las 19:30 ya es verde. */
const RED_START = 12 * 60;
const RED_END = 19 * 60 + 30;

/**
 * Festivos de España, Aragón (Jueves Santo y San Jorge) y Zaragoza (San Valero),
 * que es donde está Alfocea.
 */
export function isPublicHoliday(date: DateKey) {
  const day = fromKey(date);
  const month = day.getMonth() + 1;
  const dateNum = day.getDate();
  const fixed =
    (month === 1 && (dateNum === 1 || dateNum === 6 || dateNum === 29)) ||
    (month === 4 && dateNum === 23) ||
    (month === 5 && dateNum === 1) ||
    (month === 8 && dateNum === 15) ||
    (month === 10 && dateNum === 12) ||
    (month === 11 && dateNum === 1) ||
    (month === 12 && (dateNum === 6 || dateNum === 8 || dateNum === 25));
  if (fixed) return true;

  const easter = easterSunday(day.getFullYear());
  const thursday = toKey(addDaysDate(easter, -3));
  const friday = toKey(addDaysDate(easter, -2));
  return date === thursday || date === friday;
}

/** Sábado, domingo o festivo: el mediodía es franja roja. */
export function isRedCalendarDay(date: DateKey) {
  const weekday = fromKey(date).getDay();
  return weekday === 0 || weekday === 6 || isPublicHoliday(date);
}

/** La reserva pisa la franja roja, aunque sea solo un tramo. */
export function overlapsRedBand(date: DateKey, startTime: string, endTime: string) {
  if (!isRedCalendarDay(date)) return false;
  if (!isTime(startTime) || !isTime(endTime) || endTime <= startTime) return false;
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  return start < RED_END && end > RED_START;
}

/** Domingo de Pascua (algoritmo de Gauss, calendario gregoriano). */
function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function addDaysDate(date: Date, days: number) {
  return fromKey(addDays(toKey(date), days));
}
