import type { DataAdapter } from "@/lib/db/adapter";
import { createJsonAdapter } from "@/lib/db/json-adapter";
import { createSupabaseAdapter } from "@/lib/db/supabase-adapter";
import { hasSupabaseEnv } from "@/lib/supabase";

/**
 * Punto unico donde se elige el almacenamiento.
 * En produccion (Vercel) exige Supabase: el disco no se puede usar.
 */
function buildAdapter(): DataAdapter {
  if (hasSupabaseEnv()) return createSupabaseAdapter();

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "Faltan las variables de Supabase en Vercel: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createJsonAdapter();
}

const globalForDb = globalThis as unknown as { __alfoceaDb?: DataAdapter };

export const db: DataAdapter = globalForDb.__alfoceaDb ?? buildAdapter();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__alfoceaDb = db;
}
