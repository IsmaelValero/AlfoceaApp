import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/authz";
import { buildDiagnostics } from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

/** Diagnostico de conexion. Solo administradores. */
export default async function SaludPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/");

  const result = await buildDiagnostics();
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
