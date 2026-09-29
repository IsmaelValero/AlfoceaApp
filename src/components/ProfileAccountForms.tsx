"use client";

import { useActionState, useState } from "react";

import { FormError } from "@/components/form-parts";
import { BUTTON_STYLES } from "@/components/ui";
import type { FormState } from "@/lib/forms";

function Notice({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="rounded-2xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-dark">{message}</p>;
}

export function EmailForm({
  action,
  email,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [nextEmail, setNextEmail] = useState(email);
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state.error} />
      <Notice message={state.message} />
      <label className="block">
        <span className="field-label">Correo</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          value={nextEmail}
          onChange={(event) => setNextEmail(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="field-label">Contraseña actual</span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <button type="submit" disabled={pending} className={`${BUTTON_STYLES.secondary} w-full`}>
        {pending ? "Guardando..." : "Guardar correo"}
      </button>
    </form>
  );
}

export function PasswordForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state.error} />
      <Notice message={state.message} />
      <label className="block">
        <span className="field-label">Contraseña actual</span>
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="field-label">Nueva contraseña</span>
        <input
          name="nextPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="field"
          value={nextPassword}
          onChange={(event) => setNextPassword(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="field-label">Repite la contraseña</span>
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="field"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>
      <button type="submit" disabled={pending} className={`${BUTTON_STYLES.secondary} w-full`}>
        {pending ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
