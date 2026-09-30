import { db } from "@/lib/db";
import {
  addDays,
  eachDay,
  endOfWeek,
  rangesOverlap,
  startOfWeek,
  todayKey,
  type DateKey,
} from "@/lib/dates";
import { timesOverlap } from "@/lib/hours";
import { getSessionMemberId } from "@/lib/session";
import type { Family, Manual, ManualCategory, Member, Reservation, Rule } from "@/lib/types";
import { MANUAL_CATEGORIES } from "@/lib/types";

/** Reserva con la familia y el miembro ya resueltos, lista para pintar. */
export interface ReservationView extends Reservation {
  family: Family | null;
  member: Member | null;
}

export interface FamilyWithMembers extends Family {
  members: Member[];
}

function byStartDate(a: Reservation, b: Reservation): number {
  return a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title);
}

function toView(reservation: Reservation, families: Family[], members: Member[]): ReservationView {
  return {
    ...reservation,
    family: families.find((f) => f.id === reservation.familyId) ?? null,
    member: reservation.memberId ? (members.find((m) => m.id === reservation.memberId) ?? null) : null,
  };
}

/* --------------------------------- Familias -------------------------------- */

export async function listFamilies(): Promise<Family[]> {
  const families = await db.families.list();
  return families.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listMembers(): Promise<Member[]> {
  const members = await db.members.list();
  return members.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listFamiliesWithMembers(): Promise<FamilyWithMembers[]> {
  const [families, members] = await Promise.all([listFamilies(), listMembers()]);
  return families.map((family) => ({
    ...family,
    members: members.filter((member) => member.familyId === family.id),
  }));
}

export async function getFamilyWithMembers(id: string): Promise<FamilyWithMembers | null> {
  const [family, members] = await Promise.all([db.families.get(id), listMembers()]);
  if (!family) return null;
  return { ...family, members: members.filter((member) => member.familyId === id) };
}

export async function getMember(id: string): Promise<Member | null> {
  return db.members.get(id);
}

/* --------------------------------- Reservas -------------------------------- */

export async function listReservations(): Promise<ReservationView[]> {
  const [reservations, families, members] = await Promise.all([
    db.reservations.list(),
    db.families.list(),
    db.members.list(),
  ]);
  return reservations.sort(byStartDate).map((r) => toView(r, families, members));
}

export async function getReservation(id: string): Promise<ReservationView | null> {
  const [reservation, families, members] = await Promise.all([
    db.reservations.get(id),
    db.families.list(),
    db.members.list(),
  ]);
  return reservation ? toView(reservation, families, members) : null;
}

/**
 * Persona que tiene la sesion abierta y su familia.
 */
export async function getCurrentMember(): Promise<{ member: Member; family: Family } | null> {
  const memberId = await getSessionMemberId();
  if (!memberId) return null;
  const member = await db.members.get(memberId);
  if (!member) return null;
  const family = await db.families.get(member.familyId);
  if (!family) return null;
  return { member, family };
}

/**
 * Reservas activas que ocupan la misma zona, los mismos dias y unas horas que se pisan.
 */
export async function findOverlapping(
  startDate: DateKey,
  endDate: DateKey,
  zone: string,
  excludeId?: string,
  startTime?: string,
  endTime?: string,
): Promise<Reservation[]> {
  const reservations = await db.reservations.list();
  return reservations.filter(
    (r) =>
      r.id !== excludeId &&
      r.status !== "cancelada" &&
      r.zone === zone &&
      rangesOverlap(r.startDate, r.endDate, startDate, endDate) &&
      timesOverlap(r.startTime, r.endTime, startTime, endTime),
  );
}

/* ---------------------------- Manuales y normas ---------------------------- */

export async function listManuals(): Promise<Manual[]> {
  const manuals = await db.manuals.list();
  const order = new Map(MANUAL_CATEGORIES.map((category, index) => [category, index]));
  return manuals
    .map((manual) => ({ ...manual, attachments: manual.attachments ?? [] }))
    .sort((a, b) => {
      const left = order.get(a.category as ManualCategory) ?? MANUAL_CATEGORIES.length;
      const right = order.get(b.category as ManualCategory) ?? MANUAL_CATEGORIES.length;
      return left - right || a.title.localeCompare(b.title);
    });
}

export async function getManual(id: string): Promise<Manual | null> {
  const manual = await db.manuals.get(id);
  if (!manual) return null;
  return { ...manual, attachments: manual.attachments ?? [] };
}

const PRIORITY_ORDER: Record<Rule["priority"], number> = { alta: 0, media: 1, baja: 2 };

export async function listRules(): Promise<Rule[]> {
  const rules = await db.rules.list();
  return rules.sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.title.localeCompare(b.title),
  );
}

export async function getRule(id: string): Promise<Rule | null> {
  return db.rules.get(id);
}

/* ----------------------------------- Inicio --------------------------------- */

export interface WeekDay {
  date: DateKey;
  reservations: ReservationView[];
}

export interface HomeData {
  today: DateKey;
  weekStart: DateKey;
  weekEnd: DateKey;
  /** Los 7 dias de la semana en curso con sus reservas */
  week: WeekDay[];
  /** Reservas que tocan la semana en curso, sin repetir */
  weekReservations: ReservationView[];
  /** Reservas de hoy */
  todayReservations: ReservationView[];
  /** Siguiente reserva futura, si la hay */
  nextReservation: ReservationView | null;
  /** Reservas de los proximos 30 dias */
  upcoming: ReservationView[];
  /** Reservas pendientes de confirmar */
  pending: ReservationView[];
  pinnedRules: Rule[];
  stats: {
    daysOccupiedThisWeek: number;
    peopleThisWeek: number;
    families: number;
    members: number;
  };
}

export async function getHomeData(): Promise<HomeData> {
  const [reservations, rules, families, members] = await Promise.all([
    listReservations(),
    listRules(),
    db.families.list(),
    db.members.list(),
  ]);

  const today = todayKey();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const active = reservations.filter((r) => r.status !== "cancelada");

  const week: WeekDay[] = eachDay(weekStart, weekEnd).map((date) => ({
    date,
    reservations: active.filter((r) => r.startDate <= date && date <= r.endDate),
  }));

  const weekReservations = active.filter((r) => rangesOverlap(r.startDate, r.endDate, weekStart, weekEnd));
  const todayReservations = active.filter((r) => r.startDate <= today && today <= r.endDate);
  const horizon = addDays(today, 30);

  return {
    today,
    weekStart,
    weekEnd,
    week,
    weekReservations,
    todayReservations,
    nextReservation: active.find((r) => r.endDate >= today) ?? null,
    upcoming: active.filter((r) => r.endDate >= today && r.startDate <= horizon),
    pending: reservations.filter((r) => r.status === "pendiente" && r.endDate >= today),
    pinnedRules: rules.filter((r) => r.pinned),
    stats: {
      daysOccupiedThisWeek: week.filter((day) => day.reservations.length > 0).length,
      peopleThisWeek: weekReservations.reduce((sum, r) => sum + r.guests, 0),
      families: families.length,
      members: members.length,
    },
  };
}
