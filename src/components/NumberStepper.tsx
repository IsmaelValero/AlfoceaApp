"use client";

import { useState } from "react";

/** Contador con +/−; no se escribe a mano. */
export function NumberStepper({
  name,
  label,
  defaultValue = 0,
  min = 0,
  max = 30,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  min?: number;
  max?: number;
}) {
  const [value, setValue] = useState(() =>
    Math.min(max, Math.max(min, Number.isFinite(defaultValue) ? defaultValue : min)),
  );

  function bump(delta: number) {
    setValue((current) => Math.min(max, Math.max(min, current + delta)));
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="inline-flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-1)}
          disabled={value <= min}
          aria-label={`Quitar ${label.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-lg font-semibold text-ink transition active:scale-95 disabled:opacity-40"
        >
          −
        </button>
        <input type="hidden" name={name} value={value} />
        <span className="min-w-[1.75rem] text-center text-base font-bold tabular-nums text-ink" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => bump(1)}
          disabled={value >= max}
          aria-label={`Añadir ${label.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-lg font-semibold text-ink transition active:scale-95 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
