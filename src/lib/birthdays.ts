import type { Member } from "@/lib/types";

export const BIRTH_MONTHS = [
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
] as const;

export function formatBirthday(member: Pick<Member, "birthDay" | "birthMonth" | "birthYear">) {
  const day = member.birthDay;
  const month = member.birthMonth;
  if (!day || !month || month < 1 || month > 12) return null;
  const label = `${day} de ${BIRTH_MONTHS[month - 1]}`;
  return member.birthYear ? `${label} de ${member.birthYear}` : label;
}

/** Comprueba que el día exista en ese mes. Sin año, febrero acepta el 29. */
export function isValidBirthday(day: number, month: number, year?: number | null) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const probe = year && year > 0 ? year : 2024;
  const date = new Date(probe, month - 1, day);
  return date.getFullYear() === probe && date.getMonth() === month - 1 && date.getDate() === day;
}
