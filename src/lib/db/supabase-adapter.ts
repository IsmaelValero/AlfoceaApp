import { randomUUID } from "node:crypto";

import type { Collection, DataAdapter } from "@/lib/db/adapter";
import { getSupabase } from "@/lib/supabase";
import type {
  Entity,
  Family,
  Manual,
  Member,
  Project,
  ProjectTask,
  EventItem,
  EventRsvp,
  FamilyEvent,
  Poll,
  PollOption,
  PollVote,
  RecurringCompletion,
  RecurringTask,
  Reservation,
  Rule,
} from "@/lib/types";

type Table =
  | "families"
  | "members"
  | "reservations"
  | "manuals"
  | "rules"
  | "projects"
  | "project_tasks"
  | "recurring_tasks"
  | "recurring_completions"
  | "polls"
  | "poll_options"
  | "poll_votes"
  | "events"
  | "event_rsvps"
  | "event_items";

const FAMILY_COLUMNS = "id, name, color, notes";
const MEMBER_COLUMNS_BASE = "id, family_id, name, last_name, role, phone, email";
const MEMBER_COLUMNS = `${MEMBER_COLUMNS_BASE}, birth_day, birth_month, birth_year`;

let membersBirthReady: boolean | null = null;

async function memberSelectColumns() {
  if (membersBirthReady === true) return MEMBER_COLUMNS;
  if (membersBirthReady === false) return MEMBER_COLUMNS_BASE;
  const { error } = await getSupabase().from("members").select("birth_day").limit(1);
  membersBirthReady = !error;
  return membersBirthReady ? MEMBER_COLUMNS : MEMBER_COLUMNS_BASE;
}
const RESERVATION_COLUMNS =
  "id, title, family_id, member_id, zone, start_date, end_date, start_time, end_time, guests, status, notes, created_at, resolved_at";
const RESERVATION_COLUMNS_BASE =
  "id, title, family_id, member_id, zone, start_date, end_date, start_time, end_time, guests, status, notes, created_at";

let reservationsResolvedReady: boolean | null = null;

async function reservationsSelectColumns() {
  if (reservationsResolvedReady === true) return RESERVATION_COLUMNS;
  if (reservationsResolvedReady === false) return RESERVATION_COLUMNS_BASE;
  const { error } = await getSupabase().from("reservations").select("resolved_at").limit(1);
  reservationsResolvedReady = !error;
  return reservationsResolvedReady ? RESERVATION_COLUMNS : RESERVATION_COLUMNS_BASE;
}
const MANUAL_COLUMNS_BASE = "id, title, category, summary, content, updated_at";
const MANUAL_COLUMNS_WITH_ATTACHMENTS = `${MANUAL_COLUMNS_BASE}, attachments`;
const RULE_COLUMNS = "id, title, category, content, priority, pinned, updated_at";

let manualsAttachmentsReady: boolean | null = null;

async function manualsSelectColumns() {
  if (manualsAttachmentsReady === true) return MANUAL_COLUMNS_WITH_ATTACHMENTS;
  if (manualsAttachmentsReady === false) return MANUAL_COLUMNS_BASE;

  const { error } = await getSupabase().from("manuals").select("attachments").limit(1);
  manualsAttachmentsReady = !error;
  return manualsAttachmentsReady ? MANUAL_COLUMNS_WITH_ATTACHMENTS : MANUAL_COLUMNS_BASE;
}

export function manualsSupportAttachments() {
  return manualsAttachmentsReady !== false;
}

function mapFamily(row: Record<string, unknown>): Family {
  return {
    id: String(row.id),
    name: String(row.name),
    color: String(row.color),
    notes: row.notes ? String(row.notes) : undefined,
  };
}

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: String(row.id),
    familyId: String(row.family_id),
    name: String(row.name),
    lastName: row.last_name ? String(row.last_name) : undefined,
    role: row.role as Member["role"],
    phone: row.phone ? String(row.phone) : undefined,
    email: row.email ? String(row.email) : undefined,
    birthDay: row.birth_day ? Number(row.birth_day) : undefined,
    birthMonth: row.birth_month ? Number(row.birth_month) : undefined,
    birthYear: row.birth_year ? Number(row.birth_year) : undefined,
  };
}

function mapReservation(row: Record<string, unknown>): Reservation {
  return {
    id: String(row.id),
    title: String(row.title),
    familyId: String(row.family_id),
    memberId: row.member_id ? String(row.member_id) : undefined,
    zone: row.zone as Reservation["zone"],
    startDate: String(row.start_date),
    endDate: String(row.end_date),
    startTime: row.start_time ? String(row.start_time).slice(0, 5) : undefined,
    endTime: row.end_time ? String(row.end_time).slice(0, 5) : undefined,
    guests: Number(row.guests),
    status: row.status as Reservation["status"],
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.created_at),
    resolvedAt: row.resolved_at ? String(row.resolved_at) : undefined,
  };
}

function mapAttachments(value: unknown): Manual["attachments"] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const kind = row.kind === "pdf" ? "pdf" : row.kind === "image" ? "image" : null;
      if (!kind || !row.id || !row.url || !row.path) return null;
      return {
        id: String(row.id),
        name: String(row.name ?? "archivo"),
        kind,
        path: String(row.path),
        url: String(row.url),
      };
    })
    .filter((item): item is Manual["attachments"][number] => item !== null);
}

function mapManual(row: Record<string, unknown>): Manual {
  return {
    id: String(row.id),
    title: String(row.title),
    category: row.category as Manual["category"],
    summary: String(row.summary),
    content: String(row.content),
    attachments: mapAttachments(row.attachments),
    updatedAt: String(row.updated_at),
  };
}

function mapRule(row: Record<string, unknown>): Rule {
  return {
    id: String(row.id),
    title: String(row.title),
    category: row.category as Rule["category"],
    content: String(row.content),
    priority: row.priority as Rule["priority"],
    pinned: Boolean(row.pinned),
    updatedAt: String(row.updated_at),
  };
}

function toFamilyRow(data: Partial<Omit<Family, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.color !== undefined ? { color: data.color } : {}),
    ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
  };
}

function toMemberRow(data: Partial<Omit<Member, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.familyId !== undefined ? { family_id: data.familyId } : {}),
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.lastName !== undefined ? { last_name: data.lastName ?? null } : {}),
    ...(data.role !== undefined ? { role: data.role } : {}),
    ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
    ...(data.email !== undefined ? { email: data.email ?? null } : {}),
    ...(data.birthDay !== undefined ? { birth_day: data.birthDay ?? null } : {}),
    ...(data.birthMonth !== undefined ? { birth_month: data.birthMonth ?? null } : {}),
    ...(data.birthYear !== undefined ? { birth_year: data.birthYear ?? null } : {}),
  };
}

class MembersCollection implements Collection<Member> {
  async list(): Promise<Member[]> {
    const columns = await memberSelectColumns();
    const { data, error } = await getSupabase().from("members").select(columns);
    if (error) throw error;
    return (data ?? []).map((row) => mapMember(row as unknown as Record<string, unknown>));
  }

  async get(id: string): Promise<Member | null> {
    const columns = await memberSelectColumns();
    const { data, error } = await getSupabase().from("members").select(columns).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapMember(data as unknown as Record<string, unknown>) : null;
  }

  async create(data: Omit<Member, "id">): Promise<Member> {
    this.assertBirthdayColumn(data);
    const columns = await memberSelectColumns();
    const id = randomUUID();
    const row = toMemberRow({ ...data, id });
    const { data: created, error } = await getSupabase().from("members").insert(row).select(columns).single();
    if (error) throw error;
    return mapMember(created as unknown as Record<string, unknown>);
  }

  async update(id: string, patch: Partial<Omit<Member, "id">>): Promise<Member | null> {
    this.assertBirthdayColumn(patch);
    const columns = await memberSelectColumns();
    const row = toMemberRow(patch);
    const { data, error } = await getSupabase().from("members").update(row).eq("id", id).select(columns).maybeSingle();
    if (error) throw error;
    return data ? mapMember(data as unknown as Record<string, unknown>) : null;
  }

  async remove(id: string): Promise<boolean> {
    const { error, count } = await getSupabase().from("members").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }

  private assertBirthdayColumn(data: Partial<Member>) {
    const touchesBirthday =
      data.birthDay !== undefined || data.birthMonth !== undefined || data.birthYear !== undefined;
    if (touchesBirthday && membersBirthReady === false) {
      throw new Error("Falta el cumpleaños en Supabase. Ejecuta supabase/birthdays.sql en el SQL Editor.");
    }
  }
}

function toReservationRow(data: Partial<Omit<Reservation, "id">> & { id?: string }, withResolved: boolean) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.familyId !== undefined ? { family_id: data.familyId } : {}),
    ...(data.memberId !== undefined ? { member_id: data.memberId ?? null } : {}),
    ...(data.zone !== undefined ? { zone: data.zone } : {}),
    ...(data.startDate !== undefined ? { start_date: data.startDate } : {}),
    ...(data.endDate !== undefined ? { end_date: data.endDate } : {}),
    ...(data.startTime !== undefined ? { start_time: data.startTime ?? null } : {}),
    ...(data.endTime !== undefined ? { end_time: data.endTime ?? null } : {}),
    ...(data.guests !== undefined ? { guests: data.guests } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
    ...(withResolved && data.resolvedAt !== undefined ? { resolved_at: data.resolvedAt ?? null } : {}),
  };
}

function toManualRow(data: Partial<Omit<Manual, "id">> & { id?: string }, withAttachments: boolean) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.summary !== undefined ? { summary: data.summary } : {}),
    ...(data.content !== undefined ? { content: data.content } : {}),
    ...(withAttachments && data.attachments !== undefined ? { attachments: data.attachments } : {}),
    ...(data.updatedAt !== undefined ? { updated_at: data.updatedAt } : {}),
  };
}

function toRuleRow(data: Partial<Omit<Rule, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.content !== undefined ? { content: data.content } : {}),
    ...(data.priority !== undefined ? { priority: data.priority } : {}),
    ...(data.pinned !== undefined ? { pinned: data.pinned } : {}),
    ...(data.updatedAt !== undefined ? { updated_at: data.updatedAt } : {}),
  };
}

class SupabaseCollection<T extends Entity> implements Collection<T> {
  constructor(
    private readonly table: Table,
    private readonly columns: string,
    private readonly mapRow: (row: Record<string, unknown>) => T,
    private readonly toRow: (data: Partial<Omit<T, "id">> & { id?: string }) => Record<string, unknown>,
  ) {}

  async list(): Promise<T[]> {
    const { data, error } = await getSupabase().from(this.table).select(this.columns);
    if (error) throw error;
    return (data ?? []).map((row) => this.mapRow(row as unknown as Record<string, unknown>));
  }

  async get(id: string): Promise<T | null> {
    const { data, error } = await getSupabase().from(this.table).select(this.columns).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? this.mapRow(data as unknown as Record<string, unknown>) : null;
  }

  async create(data: Omit<T, "id">): Promise<T> {
    const id = randomUUID();
    const row = this.toRow({ ...(data as Omit<T, "id">), id } as Partial<Omit<T, "id">> & { id: string });
    const { data: created, error } = await getSupabase()
      .from(this.table)
      .insert(row)
      .select(this.columns)
      .single();
    if (error) throw error;
    return this.mapRow(created as unknown as Record<string, unknown>);
  }

  async update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | null> {
    const row = this.toRow(patch);
    const { data, error } = await getSupabase()
      .from(this.table)
      .update(row)
      .eq("id", id)
      .select(this.columns)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapRow(data as unknown as Record<string, unknown>) : null;
  }

  async remove(id: string): Promise<boolean> {
    const { error, count } = await getSupabase().from(this.table).delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
}

class ManualsCollection implements Collection<Manual> {
  async list(): Promise<Manual[]> {
    const columns = await manualsSelectColumns();
    const { data, error } = await getSupabase().from("manuals").select(columns);
    if (error) throw error;
    return (data ?? []).map((row) => mapManual(row as unknown as Record<string, unknown>));
  }

  async get(id: string): Promise<Manual | null> {
    const columns = await manualsSelectColumns();
    const { data, error } = await getSupabase().from("manuals").select(columns).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapManual(data as unknown as Record<string, unknown>) : null;
  }

  async create(data: Omit<Manual, "id">): Promise<Manual> {
    const columns = await manualsSelectColumns();
    const id = randomUUID();
    const row = toManualRow({ ...data, id }, manualsAttachmentsReady === true);
    const { data: created, error } = await getSupabase().from("manuals").insert(row).select(columns).single();
    if (error) throw error;
    return mapManual(created as unknown as Record<string, unknown>);
  }

  async update(id: string, patch: Partial<Omit<Manual, "id">>): Promise<Manual | null> {
    const columns = await manualsSelectColumns();
    if (patch.attachments && manualsAttachmentsReady === false) {
      throw new Error(
        "Falta la columna attachments en Supabase. Ejecuta supabase/manuals-attachments.sql en el SQL Editor.",
      );
    }
    const row = toManualRow(patch, manualsAttachmentsReady === true);
    const { data, error } = await getSupabase().from("manuals").update(row).eq("id", id).select(columns).maybeSingle();
    if (error) throw error;
    return data ? mapManual(data as unknown as Record<string, unknown>) : null;
  }

  async remove(id: string): Promise<boolean> {
    const { error, count } = await getSupabase().from("manuals").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
}

class ReservationsCollection implements Collection<Reservation> {
  async list(): Promise<Reservation[]> {
    const columns = await reservationsSelectColumns();
    const { data, error } = await getSupabase().from("reservations").select(columns);
    if (error) {
      if (error.code === "42703" || /resolved_at/i.test(error.message)) {
        reservationsResolvedReady = false;
        const retry = await getSupabase().from("reservations").select(RESERVATION_COLUMNS_BASE);
        if (retry.error) throw retry.error;
        return (retry.data ?? []).map((row) => mapReservation(row as unknown as Record<string, unknown>));
      }
      throw error;
    }
    return (data ?? []).map((row) => mapReservation(row as unknown as Record<string, unknown>));
  }

  async get(id: string): Promise<Reservation | null> {
    const columns = await reservationsSelectColumns();
    const { data, error } = await getSupabase().from("reservations").select(columns).eq("id", id).maybeSingle();
    if (error) {
      if (error.code === "42703" || /resolved_at/i.test(error.message)) {
        reservationsResolvedReady = false;
        const retry = await getSupabase()
          .from("reservations")
          .select(RESERVATION_COLUMNS_BASE)
          .eq("id", id)
          .maybeSingle();
        if (retry.error) throw retry.error;
        return retry.data ? mapReservation(retry.data as unknown as Record<string, unknown>) : null;
      }
      throw error;
    }
    return data ? mapReservation(data as unknown as Record<string, unknown>) : null;
  }

  async create(data: Omit<Reservation, "id">): Promise<Reservation> {
    const columns = await reservationsSelectColumns();
    const id = randomUUID();
    const row = toReservationRow({ ...data, id }, reservationsResolvedReady === true);
    const { data: created, error } = await getSupabase().from("reservations").insert(row).select(columns).single();
    if (error) throw error;
    return mapReservation(created as unknown as Record<string, unknown>);
  }

  async update(id: string, patch: Partial<Omit<Reservation, "id">>): Promise<Reservation | null> {
    const columns = await reservationsSelectColumns();
    const row = toReservationRow(patch, reservationsResolvedReady === true);
    const { data, error } = await getSupabase()
      .from("reservations")
      .update(row)
      .eq("id", id)
      .select(columns)
      .maybeSingle();
    if (error) {
      // Si aun no existe resolved_at, reintenta sin ese campo.
      if (String(error.message).includes("resolved_at")) {
        reservationsResolvedReady = false;
        const fallback = toReservationRow(patch, false);
        const retry = await getSupabase()
          .from("reservations")
          .update(fallback)
          .eq("id", id)
          .select(RESERVATION_COLUMNS_BASE)
          .maybeSingle();
        if (retry.error) throw retry.error;
        return retry.data ? mapReservation(retry.data as unknown as Record<string, unknown>) : null;
      }
      throw error;
    }
    return data ? mapReservation(data as unknown as Record<string, unknown>) : null;
  }

  async remove(id: string): Promise<boolean> {
    const { error, count } = await getSupabase().from("reservations").delete({ count: "exact" }).eq("id", id);
    if (error) throw error;
    return (count ?? 0) > 0;
  }
}

const PROJECT_COLUMNS = "id, name, description, zone, created_at, updated_at";
const PROJECT_TASK_COLUMNS = "id, project_id, title, description, zone, status, assignee_ids, created_at";
const RECURRING_COLUMNS =
  "id, title, zone, manual_id, kind, interval, weekdays, month_day, start_date, end_date, allow_done, created_at";
const COMPLETION_COLUMNS = "id, task_id, date, member_id, completed_at";

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asNumberList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item)) : [];
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    zone: String(row.zone ?? ""),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapProjectTask(row: Record<string, unknown>): ProjectTask {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    description: String(row.description ?? ""),
    zone: String(row.zone ?? ""),
    status: row.status as ProjectTask["status"],
    assigneeIds: asStringList(row.assignee_ids),
    createdAt: String(row.created_at),
  };
}

function mapRecurringTask(row: Record<string, unknown>): RecurringTask {
  return {
    id: String(row.id),
    title: String(row.title),
    zone: String(row.zone ?? ""),
    manualId: row.manual_id ? String(row.manual_id) : undefined,
    kind: row.kind as RecurringTask["kind"],
    interval: Number(row.interval) || 1,
    weekdays: asNumberList(row.weekdays),
    monthDay: row.month_day ? Number(row.month_day) : undefined,
    startDate: String(row.start_date).slice(0, 10),
    endDate: row.end_date ? String(row.end_date).slice(0, 10) : null,
    allowDone: Boolean(row.allow_done),
    createdAt: String(row.created_at),
  };
}

function mapCompletion(row: Record<string, unknown>): RecurringCompletion {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    date: String(row.date).slice(0, 10),
    memberId: row.member_id ? String(row.member_id) : undefined,
    completedAt: String(row.completed_at),
  };
}

function toProjectRow(data: Partial<Omit<Project, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.zone !== undefined ? { zone: data.zone } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
    ...(data.updatedAt !== undefined ? { updated_at: data.updatedAt } : {}),
  };
}

function toProjectTaskRow(data: Partial<Omit<ProjectTask, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.projectId !== undefined ? { project_id: data.projectId } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.zone !== undefined ? { zone: data.zone } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.assigneeIds !== undefined ? { assignee_ids: data.assigneeIds } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

function toRecurringRow(data: Partial<Omit<RecurringTask, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.zone !== undefined ? { zone: data.zone } : {}),
    ...(data.manualId !== undefined ? { manual_id: data.manualId ?? null } : {}),
    ...(data.kind !== undefined ? { kind: data.kind } : {}),
    ...(data.interval !== undefined ? { interval: data.interval } : {}),
    ...(data.weekdays !== undefined ? { weekdays: data.weekdays } : {}),
    ...(data.monthDay !== undefined ? { month_day: data.monthDay ?? null } : {}),
    ...(data.startDate !== undefined ? { start_date: data.startDate } : {}),
    ...(data.endDate !== undefined ? { end_date: data.endDate ?? null } : {}),
    ...(data.allowDone !== undefined ? { allow_done: data.allowDone } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

const POLL_COLUMNS = "id, month, status, event_id, created_at";
const POLL_OPTION_COLUMNS = "id, poll_id, label, start_date, end_date, sort_order";
const POLL_VOTE_COLUMNS = "id, poll_id, option_id, family_id, member_id, people_count, created_at";
const EVENT_COLUMNS = "id, title, kind, start_date, end_date, place, notes, month, poll_id, created_at";
const RSVP_COLUMNS = "id, event_id, family_id, member_id, status, people_count, created_at";
const ITEM_COLUMNS = "id, event_id, name, quantity, member_id, created_at";

function mapPoll(row: Record<string, unknown>): Poll {
  return {
    id: String(row.id),
    month: String(row.month),
    status: row.status as Poll["status"],
    eventId: row.event_id ? String(row.event_id) : null,
    createdAt: String(row.created_at),
  };
}

function mapPollOption(row: Record<string, unknown>): PollOption {
  return {
    id: String(row.id),
    pollId: String(row.poll_id),
    label: String(row.label),
    startDate: String(row.start_date).slice(0, 10),
    endDate: String(row.end_date).slice(0, 10),
    sortOrder: Number(row.sort_order),
  };
}

function mapPollVote(row: Record<string, unknown>): PollVote {
  return {
    id: String(row.id),
    pollId: String(row.poll_id),
    optionId: String(row.option_id),
    familyId: String(row.family_id),
    memberId: String(row.member_id),
    peopleCount: Number(row.people_count),
    createdAt: String(row.created_at),
  };
}

function mapFamilyEvent(row: Record<string, unknown>): FamilyEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    kind: row.kind as FamilyEvent["kind"],
    startDate: String(row.start_date).slice(0, 10),
    endDate: String(row.end_date).slice(0, 10),
    place: row.place ? String(row.place) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    month: row.month ? String(row.month) : null,
    pollId: row.poll_id ? String(row.poll_id) : null,
    createdAt: String(row.created_at),
  };
}

function mapEventRsvp(row: Record<string, unknown>): EventRsvp {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    familyId: String(row.family_id),
    memberId: String(row.member_id),
    status: row.status as EventRsvp["status"],
    peopleCount: Number(row.people_count),
    createdAt: String(row.created_at),
  };
}

function mapEventItem(row: Record<string, unknown>): EventItem {
  return {
    id: String(row.id),
    eventId: String(row.event_id),
    name: String(row.name),
    quantity: String(row.quantity),
    memberId: row.member_id ? String(row.member_id) : undefined,
    createdAt: String(row.created_at),
  };
}

function toPollRow(data: Partial<Omit<Poll, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.month !== undefined ? { month: data.month } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.eventId !== undefined ? { event_id: data.eventId ?? null } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

function toPollOptionRow(data: Partial<Omit<PollOption, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.pollId !== undefined ? { poll_id: data.pollId } : {}),
    ...(data.label !== undefined ? { label: data.label } : {}),
    ...(data.startDate !== undefined ? { start_date: data.startDate } : {}),
    ...(data.endDate !== undefined ? { end_date: data.endDate } : {}),
    ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
  };
}

function toPollVoteRow(data: Partial<Omit<PollVote, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.pollId !== undefined ? { poll_id: data.pollId } : {}),
    ...(data.optionId !== undefined ? { option_id: data.optionId } : {}),
    ...(data.familyId !== undefined ? { family_id: data.familyId } : {}),
    ...(data.memberId !== undefined ? { member_id: data.memberId } : {}),
    ...(data.peopleCount !== undefined ? { people_count: data.peopleCount } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

function toFamilyEventRow(data: Partial<Omit<FamilyEvent, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.kind !== undefined ? { kind: data.kind } : {}),
    ...(data.startDate !== undefined ? { start_date: data.startDate } : {}),
    ...(data.endDate !== undefined ? { end_date: data.endDate } : {}),
    ...(data.place !== undefined ? { place: data.place ?? null } : {}),
    ...(data.notes !== undefined ? { notes: data.notes ?? null } : {}),
    ...(data.month !== undefined ? { month: data.month ?? null } : {}),
    ...(data.pollId !== undefined ? { poll_id: data.pollId ?? null } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

function toEventRsvpRow(data: Partial<Omit<EventRsvp, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.eventId !== undefined ? { event_id: data.eventId } : {}),
    ...(data.familyId !== undefined ? { family_id: data.familyId } : {}),
    ...(data.memberId !== undefined ? { member_id: data.memberId } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.peopleCount !== undefined ? { people_count: data.peopleCount } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

function toEventItemRow(data: Partial<Omit<EventItem, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.eventId !== undefined ? { event_id: data.eventId } : {}),
    ...(data.name !== undefined ? { name: data.name } : {}),
    ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
    ...(data.memberId !== undefined ? { member_id: data.memberId ?? null } : {}),
    ...(data.createdAt !== undefined ? { created_at: data.createdAt } : {}),
  };
}

function toCompletionRow(data: Partial<Omit<RecurringCompletion, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.taskId !== undefined ? { task_id: data.taskId } : {}),
    ...(data.date !== undefined ? { date: data.date } : {}),
    ...(data.memberId !== undefined ? { member_id: data.memberId ?? null } : {}),
    ...(data.completedAt !== undefined ? { completed_at: data.completedAt } : {}),
  };
}

export function createSupabaseAdapter(): DataAdapter {
  return {
    families: new SupabaseCollection<Family>("families", FAMILY_COLUMNS, mapFamily, toFamilyRow),
    members: new MembersCollection(),
    reservations: new ReservationsCollection(),
    manuals: new ManualsCollection(),
    rules: new SupabaseCollection<Rule>("rules", RULE_COLUMNS, mapRule, toRuleRow),
    projects: new SupabaseCollection<Project>("projects", PROJECT_COLUMNS, mapProject, toProjectRow),
    projectTasks: new SupabaseCollection<ProjectTask>(
      "project_tasks",
      PROJECT_TASK_COLUMNS,
      mapProjectTask,
      toProjectTaskRow,
    ),
    recurringTasks: new SupabaseCollection<RecurringTask>(
      "recurring_tasks",
      RECURRING_COLUMNS,
      mapRecurringTask,
      toRecurringRow,
    ),
    recurringCompletions: new SupabaseCollection<RecurringCompletion>(
      "recurring_completions",
      COMPLETION_COLUMNS,
      mapCompletion,
      toCompletionRow,
    ),
    polls: new SupabaseCollection<Poll>("polls", POLL_COLUMNS, mapPoll, toPollRow),
    pollOptions: new SupabaseCollection<PollOption>("poll_options", POLL_OPTION_COLUMNS, mapPollOption, toPollOptionRow),
    pollVotes: new SupabaseCollection<PollVote>("poll_votes", POLL_VOTE_COLUMNS, mapPollVote, toPollVoteRow),
    events: new SupabaseCollection<FamilyEvent>("events", EVENT_COLUMNS, mapFamilyEvent, toFamilyEventRow),
    eventRsvps: new SupabaseCollection<EventRsvp>("event_rsvps", RSVP_COLUMNS, mapEventRsvp, toEventRsvpRow),
    eventItems: new SupabaseCollection<EventItem>("event_items", ITEM_COLUMNS, mapEventItem, toEventItemRow),
  };
}
