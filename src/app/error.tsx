"use client";

import { BUTTON_STYLES } from "@/components/ui";

function friendlyMessage(error: Error) {
  const raw = error.message || "";
  if (raw.includes("DATABASE_URL")) {
    return "Esta app no usa DATABASE_URL. En Vercel pon NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.";
  }
  if (raw.includes("NEXT_PUBLIC_SUPABASE_URL") || raw.includes("SUPABASE_SERVICE_ROLE_KEY") || raw.includes("Faltan")) {
    return raw;
  }
  if (raw.includes("Supabase") || raw.includes("SUPABASE") || raw.includes("supabase.co")) {
    return raw;
  }
  if (raw.includes("omitted in production") || raw.includes("Server Components render")) {
    return "Error al cargar datos. Revisa /api/health y que en Vercel esten NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.";
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
