import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let clientKey: string | null = null;

function normalizeSupabaseUrl(raw: string) {
  const value = raw.trim().replace(/\/$/, "");
  // Evita pegar por error la URL del dashboard.
  const dashboard = value.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)(?:\.supabase\.co)?/i);
  if (dashboard) return `https://${dashboard[1]}.supabase.co`;
  return value;
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Cliente servidor con service role: la app gestiona sesion y auth a su manera. */
export function getSupabase() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!rawUrl || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  }

  const url = normalizeSupabaseUrl(rawUrl);
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL debe ser https://TU-PROYECTO.supabase.co (no la URL del dashboard).",
    );
  }

  const cacheKey = `${url}|${key}`;
  if (!client || clientKey !== cacheKey) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    clientKey = cacheKey;
  }

  return client;
}
