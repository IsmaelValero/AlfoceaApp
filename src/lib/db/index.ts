import type { DataAdapter } from "@/lib/db/adapter";
import { createJsonAdapter } from "@/lib/db/json-adapter";
import { createSupabaseAdapter } from "@/lib/db/supabase-adapter";
import { hasSupabaseEnv } from "@/lib/supabase";

/**
 * Punto unico donde se elige el almacenamiento.
 * Con variables de Supabase usa Postgres; si no, cae a JSON local vacio.
 */
function buildAdapter(): DataAdapter {
  if (hasSupabaseEnv()) return createSupabaseAdapter();
  return createJsonAdapter();
}

const globalForDb = globalThis as unknown as { __alfoceaDb?: DataAdapter };

export const db: DataAdapter = globalForDb.__alfoceaDb ?? buildAdapter();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__alfoceaDb = db;
}
