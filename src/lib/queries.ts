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
import { currentMonthKey, isSingleDayOption, weekendChoices } from "@/lib/events";
import { timesOverlap } from "@/lib/hours";
import { occurrencesBetween } from "@/lib/recurrence";
import { getSessionMemberId } from "@/lib/session";
import type {
  EventItem,
  EventRsvp,
  Family,
  FamilyEvent,
  Manual,
  ManualCategory,
  Member,
  Poll,
  PollOption,
  PollVote,
  Project,
  ProjectTask,
  RecurringCompletion,
  RecurringTask,
  Reservation,
  Rule,
} from "@/lib/types";
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
    // Todas las pendientes: el admin debe verlas aunque el dia ya haya pasado.
    pending: reservations.filter((r) => r.status === "pendiente"),
    pinnedRules: rules.filter((r) => r.pinned),
    stats: {
      daysOccupiedThisWeek: week.filter((day) => day.reservations.length > 0).length,
      peopleThisWeek: weekReservations.reduce((sum, r) => sum + r.guests, 0),
      families: families.length,
      members: members.length,
    },
  };
}

export interface WorkData {
  missing: boolean;
  projects: Project[];
  tasks: ProjectTask[];
  recurring: RecurringTask[];
  completions: RecurringCompletion[];
  members: Member[];
  manuals: Manual[];
}

function isMissingWorkTable(error: unknown) {
  const record = error && typeof error === "object" ? (error as { code?: string; message?: string }) : {};
  const message = record.message ?? (error instanceof Error ? error.message : String(error));
  return record.code === "42P01" || /does not exist|schema cache|project_tasks|recurring_tasks/i.test(message);
}

const EMPTY_WORK: WorkData = {
  missing: false,
  projects: [],
  tasks: [],
  recurring: [],
  completions: [],
  members: [],
  manuals: [],
};

async function listRecentCompletions(): Promise<RecurringCompletion[]> {
  const since = addDays(todayKey(), -120);
  try {
    const { getSupabase, hasSupabaseEnv } = await import("@/lib/supabase");
    if (hasSupabaseEnv()) {
      const { data, error } = await getSupabase()
        .from("recurring_completions")
        .select("id, task_id, date, member_id, completed_at")
        .gte("date", since)
        .order("date", { ascending: false })
        .limit(800);
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: String(row.id),
        taskId: String(row.task_id),
        date: String(row.date).slice(0, 10),
        memberId: row.member_id ? String(row.member_id) : undefined,
        completedAt: String(row.completed_at),
      }));
    }
  } catch (error) {
    if (!isMissingWorkTable(error)) {
      // Si falla el filtro, caemos al listado general abajo.
    } else {
      throw error;
    }
  }
  const all = await db.recurringCompletions.list();
  return all.filter((item) => item.date >= since);
}

export async function loadWorkData(): Promise<WorkData> {
  try {
    const [projects, tasks, recurring, completions, members, manuals] = await Promise.all([
      db.projects.list(),
      db.projectTasks.list(),
      db.recurringTasks.list(),
      listRecentCompletions(),
      db.members.list(),
      db.manuals.list(),
    ]);
    return { missing: false, projects, tasks, recurring, completions, members, manuals };
  } catch (error) {
    if (isMissingWorkTable(error)) return { ...EMPTY_WORK, missing: true };
    throw error;
  }
}

export interface WeekTask {
  task: RecurringTask;
  date: DateKey;
  manual: Manual | null;
  done: boolean;
  doneBy?: string;
}

export async function listWeekTasks(today = todayKey()): Promise<WeekTask[]> {
  const work = await loadWorkData();
  if (work.missing) return [];
  const start = startOfWeek(today);
  const end = endOfWeek(today);
  const items: WeekTask[] = [];

  for (const task of work.recurring) {
    const manual = task.manualId ? (work.manuals.find((item) => item.id === task.manualId) ?? null) : null;
    for (const date of occurrencesBetween(task, start, end)) {
      const completion = work.completions.find((item) => item.taskId === task.id && item.date === date);
      const member = completion?.memberId ? work.members.find((item) => item.id === completion.memberId) : undefined;
      items.push({ task, date, manual, done: Boolean(completion), doneBy: member?.name });
    }
  }

  return items.sort((a, b) => a.date.localeCompare(b.date) || a.task.title.localeCompare(b.task.title));
}

/* ---------------------------------- Eventos --------------------------------- */

export interface EventBoard {
  missing: boolean;
  month: string;
  polls: Poll[];
  options: PollOption[];
  votes: PollVote[];
  events: FamilyEvent[];
  rsvps: EventRsvp[];
  items: EventItem[];
  families: Family[];
  members: Member[];
}

const EMPTY_EVENTS: EventBoard = {
  missing: true,
  month: "",
  polls: [],
  options: [],
  votes: [],
  events: [],
  rsvps: [],
  items: [],
  families: [],
  members: [],
};

function isMissingEventTable(error: unknown) {
  const record = error && typeof error === "object" ? (error as { code?: string; message?: string }) : {};
  const message = record.message ?? (error instanceof Error ? error.message : String(error));
  return record.code === "42P01" || record.code === "PGRST205" || /does not exist|schema cache|polls|event_rsvps|event_items/i.test(message);
}

function isUniqueViolation(error: unknown) {
  const record = error && typeof error === "object" ? (error as { code?: string }) : {};
  return record.code === "23505";
}

/** Cierra encuestas abiertas de meses anteriores. No crea nada. */
async function closeStalePolls(polls: Poll[], month: string) {
  await Promise.all(
    polls
      .filter((poll) => poll.status === "abierta" && poll.month < month)
      .map((poll) => db.polls.update(poll.id, { status: "cerrada" })),
  );
}

/** Quita opciones tipo “finde” (dos días) de una encuesta abierta. */
async function pruneMultiDayPollOptions(pollId: string) {
  const options = await db.pollOptions.list();
  const obsolete = options.filter((option) => option.pollId === pollId && !isSingleDayOption(option));
  await Promise.all(obsolete.map((option) => db.pollOptions.remove(option.id)));
}

/**
 * Abre la encuesta del mes actual si no existe.
 * Solo debe llamarse desde Eventos / Encuesta, no desde Inicio.
 */
export async function ensureCurrentMonthPoll() {
  const today = todayKey();
  const month = currentMonthKey(today);
  const listed = await db.polls.list();
  await closeStalePolls(listed, month);
  const existingMonth = listed.find((poll) => poll.month === month);
  if (existingMonth) {
    if (existingMonth.status === "abierta") {
      await pruneMultiDayPollOptions(existingMonth.id);
    }
    return existingMonth;
  }

  const choices = weekendChoices(month, today);
  if (choices.length === 0) {
    throw new Error("Ya no quedan sábados ni domingos este mes para la encuesta.");
  }

  try {
    const poll = await db.polls.create({
      month,
      status: "abierta",
      eventId: null,
      createdAt: new Date().toISOString(),
    });
    await Promise.all(
      choices.map((choice, index) =>
        db.pollOptions.create({
          pollId: poll.id,
          label: choice.label,
          startDate: choice.startDate,
          endDate: choice.endDate,
          sortOrder: index,
        }),
      ),
    );
    return poll;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const again = await db.polls.list();
    const existing = again.find((poll) => poll.month === month);
    if (!existing) throw error;
    return existing;
  }
}

export async function loadEventBoard(options?: { ensurePoll?: boolean }): Promise<EventBoard> {
  const month = currentMonthKey(todayKey());
  try {
    let polls = await db.polls.list();
    await closeStalePolls(polls, month);
    polls = await db.polls.list();
    if (options?.ensurePoll) {
      await ensureCurrentMonthPoll();
      polls = await db.polls.list();
    }
    const [pollOptions, votes, events, rsvps, items, families, members] = await Promise.all([
      db.pollOptions.list(),
      db.pollVotes.list(),
      db.events.list(),
      db.eventRsvps.list(),
      db.eventItems.list(),
      db.families.list(),
      db.members.list(),
    ]);
    return {
      missing: false,
      month,
      polls,
      options: pollOptions,
      votes,
      events,
      rsvps,
      items,
      families,
      members,
    };
  } catch (error) {
    if (isMissingEventTable(error)) return { ...EMPTY_EVENTS, month };
    throw error;
  }
}

export async function loadEventNotices(familyId?: string) {
  const board = await loadEventBoard();
  if (board.missing) return { missing: true, month: board.month, pollOpen: false, pending: [] as FamilyEvent[] };
  const today = todayKey();
  const pollOpen = board.polls.some((poll) => poll.month === board.month && poll.status === "abierta");
  const pending = familyId
    ? board.events
        .filter(
          (event) =>
            event.endDate >= today &&
            !board.rsvps.some((rsvp) => rsvp.eventId === event.id && rsvp.familyId === familyId),
        )
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
    : [];
  return { missing: false, month: board.month, pollOpen, pending };
}
