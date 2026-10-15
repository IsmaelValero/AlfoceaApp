import { MONTH_LABELS, fromKey, toKey, type DateKey } from "@/lib/dates";

export interface WeekendChoice {
  label: string;
  startDate: DateKey;
  endDate: DateKey;
}

export function currentMonthKey(today: DateKey) {
  return today.slice(0, 7);
}

export function monthName(monthKey: string) {
  const month = Number(monthKey.slice(5, 7));
  return MONTH_LABELS[month - 1] ?? monthKey;
}

/**
 * Sábados, domingos y findes de ese mes.
 * Si se pasa `notBefore`, se ocultan opciones cuyo finya ha pasado.
 */
export function weekendChoices(monthKey: string, notBefore?: DateKey): WeekendChoice[] {
  const [year, month] = monthKey.split("-").map(Number);
  const cursor = new Date(year, month - 1, 1, 12);
  const end = new Date(year, month, 0, 12);
  const choices: WeekendChoice[] = [];

  if (cursor.getDay() === 0) {
    const sunday = toKey(cursor);
    choices.push({ label: `Domingo ${dayLabel(sunday)}`, startDate: sunday, endDate: sunday });
  }

  while (cursor <= end) {
    if (cursor.getDay() === 6) {
      const saturday = toKey(cursor);
      const sundayDate = new Date(cursor);
      sundayDate.setDate(sundayDate.getDate() + 1);
      const sunday = toKey(sundayDate);
      const sundayInMonth = sundayDate.getMonth() === month - 1;
      choices.push({ label: `Sábado ${dayLabel(saturday)}`, startDate: saturday, endDate: saturday });
      if (sundayInMonth) {
        choices.push({ label: `Domingo ${dayLabel(sunday)}`, startDate: sunday, endDate: sunday });
        choices.push({
          label: `Finde ${spanLabel(saturday, sunday)}`,
          startDate: saturday,
          endDate: sunday,
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  if (!notBefore) return choices;
  return choices.filter((choice) => choice.endDate >= notBefore);
}

function dayLabel(key: DateKey) {
  const date = fromKey(key);
  return `${date.getDate()} de ${MONTH_LABELS[date.getMonth()]}`;
}

function spanLabel(start: DateKey, end: DateKey) {
  const a = fromKey(start);
  const b = fromKey(end);
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} y ${b.getDate()} de ${MONTH_LABELS[a.getMonth()]}`;
  }
  return `${a.getDate()} de ${MONTH_LABELS[a.getMonth()]} y ${b.getDate()} de ${MONTH_LABELS[b.getMonth()]}`;
}
