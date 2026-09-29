import type { Entity, Family, Manual, Member, Reservation, Rule } from "@/lib/types";

/**
 * Contrato de acceso a datos. Las pantallas solo hablan con esta interfaz,
 * nunca con el almacenamiento concreto, de modo que migrar a Postgres,
 * Supabase o SQLite consiste en escribir un nuevo adaptador.
 */
export interface Collection<T extends Entity> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | null>;
  remove(id: string): Promise<boolean>;
}

export interface DataAdapter {
  families: Collection<Family>;
  members: Collection<Member>;
  reservations: Collection<Reservation>;
  manuals: Collection<Manual>;
  rules: Collection<Rule>;
}
