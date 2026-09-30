import { getSupabase, getSupabaseConfig, hasSupabaseEnv } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Diagnostico publico de conexion (sin secretos). No requiere login. */
export default async function SaludPage() {
  const result: Record<string, unknown> = {
    hasEnv: hasSupabaseEnv(),
    vercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const { url, key } = getSupabaseConfig();
    result.url = url;
    result.keyPrefix = `${key.slice(0, 6)}...`;
    result.keyLength = key.length;

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

  const ok = result.db === "ok";

  return (
    <main className="screen mx-auto max-w-lg py-10">
      <p className="section-title">Alfocea</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Estado de conexion</h1>
      <p className="mt-2 text-sm text-muted">
        {ok
          ? "Supabase responde bien desde este deploy."
          : "Si hasEnv es false, faltan variables en Vercel (Production), no en .env.local."}
      </p>
      <pre className="mt-6 overflow-x-auto rounded-xl bg-ink/5 p-4 text-left text-xs leading-relaxed text-ink">
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
