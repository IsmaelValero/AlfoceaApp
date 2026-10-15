"use client";

import { useState } from "react";

/** Bocadillo breve al pulsar el signo de informacion. */
export function InfoTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Mas informacion"
        onClick={() => setOpen((value) => !value)}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-line bg-surface text-[0.7rem] font-bold text-brand"
      >
        i
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-7 left-1/2 z-20 w-56 -translate-x-1/2 rounded-2xl border border-line bg-surface px-3 py-2 text-left text-xs font-medium normal-case leading-snug tracking-normal text-ink shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
