import type { DataAdapter } from "@/lib/db/adapter";
import { createJsonAdapter } from "@/lib/db/json-adapter";
import { createSupabaseAdapter } from "@/lib/db/supabase-adapter";
import { hasSupabaseEnv } from "@/lib/supabase";

/**
 * Punto unico donde se elige el almacenamiento.
 * En produccion (Vercel) exige Supabase via URL + service role key.
 * No usa DATABASE_URL ni el pooler de Postgres.
 */
function buildAdapter(): DataAdapter {
  if (hasSupabaseEnv()) return createSupabaseAdapter();

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "Faltan en Vercel NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY. Esta app no usa DATABASE_URL.",
    );
  }

  return createJsonAdapter();
}

const globalForDb = globalThis as unknown as { __alfoceaDb?: DataAdapter };

export const db: DataAdapter = globalForDb.__alfoceaDb ?? buildAdapter();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__alfoceaDb = db;
}
