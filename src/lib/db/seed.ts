import type { Family, Manual, Member, Reservation, Rule } from "@/lib/types";

/**
 * Semilla local vacia. Los datos reales viven en Supabase (supabase/schema.sql).
 * Si la app arranca sin variables de Supabase, las colecciones JSON empiezan vacias.
 */

export function seedFamilies(): Family[] {
  return [];
}

export function seedMembers(): Member[] {
  return [];
}

export function seedReservations(): Reservation[] {
  return [];
}

export function seedManuals(): Manual[] {
  return [];
}

export function seedRules(): Rule[] {
  return [];
}
