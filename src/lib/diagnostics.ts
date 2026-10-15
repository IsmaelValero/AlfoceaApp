import { getSupabase, getSupabaseConfig, hasSupabaseEnv } from "@/lib/supabase";

/** Diagnostico interno. No incluye el valor de la service role key. */
export async function buildDiagnostics() {
  const result: Record<string, unknown> = {
    hasEnv: hasSupabaseEnv(),
    hasSessionSecret: Boolean(process.env.ALFOCEA_SESSION_SECRET?.trim()),
    vercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const { url } = getSupabaseConfig();
    result.url = url;

    const { data, error } = await getSupabase().from("families").select("id,name").limit(1);
    if (error) {
      result.db = "error";
      result.dbMessage = error.message;
      result.dbCode = error.code;
    } else {
      result.db = "ok";
      result.familiesSample = data?.length ?? 0;
    }
  } catch (error) {
    result.configError = error instanceof Error ? error.message : String(error);
  }

  return result;
}
