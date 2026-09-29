"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import { BUTTON_STYLES } from "@/components/ui";

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-2xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
    >
      {message}
    </p>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${BUTTON_STYLES.primary} flex-1`}>
      {pending ? "Guardando..." : label}
    </button>
  );
}

export function FormActions({ submitLabel, cancelHref }: { submitLabel: string; cancelHref: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <SubmitButton label={submitLabel} />
      <Link href={cancelHref} replace className={BUTTON_STYLES.secondary}>
        Cancelar
      </Link>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label" htmlFor={htmlFor}>
        {label}
        {hint ? <span className="font-normal"> ({hint})</span> : null}
      </label>
      {children}
    </div>
  );
}
