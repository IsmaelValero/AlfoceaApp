import { addDays, daysBetween, eachDay, fromKey, startOfWeek, type DateKey } from "@/lib/dates";
import type { RecurringTask } from "@/lib/types";

const WEEKDAYS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

/** 0 = lunes ... 6 = domingo. */
export function weekdayIndex(date: DateKey) {
  return (fromKey(date).getDay() + 6) % 7;
}

export function occursOn(task: RecurringTask, date: DateKey) {
  if (date < task.startDate) return false;
  if (task.endDate && date > task.endDate) return false;

  if (task.kind === "every_other_day") {
    return daysBetween(task.startDate, date) % 2 === 0;
  }

  if (task.kind === "every_n_days") {
    const step = Math.max(1, task.interval);
    return daysBetween(task.startDate, date) % step === 0;
  }

  if (task.kind === "monthly") {
    const target = task.monthDay ?? fromKey(task.startDate).getDate();
    return fromKey(date).getDate() === target;
  }

  if (!task.weekdays.includes(weekdayIndex(date))) return false;
  const weeks = Math.floor(daysBetween(startOfWeek(task.startDate), startOfWeek(date)) / 7);
  return weeks % Math.max(1, task.interval) === 0;
}

export function occurrencesBetween(task: RecurringTask, start: DateKey, end: DateKey) {
  const from = start > task.startDate ? start : task.startDate;
  const to = task.endDate && task.endDate < end ? task.endDate : end;
  if (from > to) return [];
  return eachDay(from, to).filter((date) => occursOn(task, date));
}

/** Avanza como mucho un año para no bloquear el calendario. */
export function occurrencesInGrid(task: RecurringTask, dates: DateKey[]) {
  return dates.filter((date) => occursOn(task, date));
}

export function describeRecurrence(task: RecurringTask) {
  if (task.kind === "every_other_day") return "Cada dos dias";
  if (task.kind === "every_n_days") {
    return task.interval <= 1 ? "Cada dia" : `Cada ${task.interval} dias`;
  }
  if (task.kind === "monthly") {
    const day = task.monthDay ?? fromKey(task.startDate).getDate();
    return `El dia ${day} de cada mes`;
  }
  const days = task.weekdays.map((day) => WEEKDAYS[day] ?? "").filter(Boolean);
  const when = days.length ? days.join(", ") : "sin dia";
  if (task.interval <= 1) return `Cada ${when}`;
  return `Cada ${task.interval} semanas, los ${when}`;
}

export function nextDate(task: RecurringTask, from: DateKey): DateKey | null {
  let cursor = from < task.startDate ? task.startDate : from;
  const limit = task.endDate ?? addDays(cursor, 370);
  for (let i = 0; i < 370 && cursor <= limit; i++) {
    if (occursOn(task, cursor)) return cursor;
    cursor = addDays(cursor, 1);
  }
  return null;
}
