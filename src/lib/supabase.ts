import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let clientKey: string | null = null;

function normalizeSupabaseUrl(raw: string) {
  const value = raw.trim().replace(/\/$/, "");
  // Evita pegar por error la URL del dashboard.
  const dashboard = value.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)(?:\.supabase\.co)?/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;
  const embedded = value.match(/([a-z0-9]{20})\.supabase\.co/i);
  if (embedded && !/^https:\/\//i.test(value)) return `https://${embedded[1]}.supabase.co`;
  return value;
}

function readSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""
  );
}

function readServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    ""
  );
}

export function hasSupabaseEnv() {
  return Boolean(readSupabaseUrl() && readServiceRoleKey());
}

export function getSupabaseConfig() {
  const rawUrl = readSupabaseUrl();
  const key = readServiceRoleKey();
  if (!rawUrl || !key) {
    throw new Error(
      "Faltan variables en Vercel: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (no hace falta DATABASE_URL).",
    );
  }

  const url = normalizeSupabaseUrl(rawUrl);
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL debe ser https://TU-PROYECTO.supabase.co (no el dashboard ni el pooler de Postgres).",
    );
  }

  return { url, key };
}

/** Cliente servidor con service role: la app gestiona sesion y auth a su manera. */
export function getSupabase() {
  const { url, key } = getSupabaseConfig();
  const cacheKey = `${url}|${key}`;
  if (!client || clientKey !== cacheKey) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    clientKey = cacheKey;
  }

  return client;
}
