import { randomUUID } from "node:crypto";

import type { Collection, DataAdapter } from "@/lib/db/adapter";
import { getSupabase } from "@/lib/supabase";
import type { Entity, Family, Manual, Member, Reservation, Rule } from "@/lib/types";

type Table = "families" | "members" | "reservations" | "manuals" | "rules";

const FAMILY_COLUMNS = "id, name, color, notes";
const MEMBER_COLUMNS = "id, family_id, name, last_name, role, phone, email";
const RESERVATION_COLUMNS =
  "id, title, family_id, member_id, zone, start_date, end_date, start_time, end_time, guests, status, notes, created_at";
const MANUAL_COLUMNS = "id, title, category, summary, content, attachments, updated_at";
const RULE_COLUMNS = "id, title, category, content, priority, pinned, updated_at";

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
  };
}

function toReservationRow(data: Partial<Omit<Reservation, "id">> & { id?: string }) {
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
  };
}

function toManualRow(data: Partial<Omit<Manual, "id">> & { id?: string }) {
  return {
    ...(data.id ? { id: data.id } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.category !== undefined ? { category: data.category } : {}),
    ...(data.summary !== undefined ? { summary: data.summary } : {}),
    ...(data.content !== undefined ? { content: data.content } : {}),
    ...(data.attachments !== undefined ? { attachments: data.attachments } : {}),
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

export function createSupabaseAdapter(): DataAdapter {
  return {
    families: new SupabaseCollection<Family>("families", FAMILY_COLUMNS, mapFamily, toFamilyRow),
    members: new SupabaseCollection<Member>("members", MEMBER_COLUMNS, mapMember, toMemberRow),
    reservations: new SupabaseCollection<Reservation>(
      "reservations",
      RESERVATION_COLUMNS,
      mapReservation,
      toReservationRow,
    ),
    manuals: new SupabaseCollection<Manual>("manuals", MANUAL_COLUMNS, mapManual, toManualRow),
    rules: new SupabaseCollection<Rule>("rules", RULE_COLUMNS, mapRule, toRuleRow),
  };
}
