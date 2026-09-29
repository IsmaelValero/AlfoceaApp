"use client";

import { BUTTON_STYLES } from "@/components/ui";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="screen flex min-h-full flex-col items-center justify-center py-16 text-center">
      <p className="section-title">Alfocea</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Algo ha salido mal</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        {error.message || "No hemos podido cargar esta pantalla."}
      </p>
      <button type="button" onClick={reset} className={`${BUTTON_STYLES.primary} mt-6`}>
        Reintentar
      </button>
    </main>
  );
}
