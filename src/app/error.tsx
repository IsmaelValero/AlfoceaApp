"use client";

import { BUTTON_STYLES } from "@/components/ui";

function friendlyMessage(error: Error) {
  const raw = error.message || "";
  if (raw.includes("Supabase") || raw.includes("SUPABASE")) {
    return "Falta configurar Supabase en Vercel (URL y service role key).";
  }
  if (raw.includes("omitted in production") || raw.includes("Server Components render")) {
    return "Ha fallado la carga de datos. Revisa que Supabase este configurado en Vercel y vuelve a intentar.";
  }
  return raw || "No hemos podido cargar esta pantalla.";
}

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="screen flex min-h-full flex-col items-center justify-center py-16 text-center">
      <p className="section-title">Alfocea</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Algo ha salido mal</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">{friendlyMessage(error)}</p>
      <button type="button" onClick={reset} className={`${BUTTON_STYLES.primary} mt-6`}>
        Reintentar
      </button>
    </main>
  );
}
