"use client";

import { useActionState, useState } from "react";

import { FormError } from "@/components/form-parts";
import { BUTTON_STYLES } from "@/components/ui";
import type { FormState } from "@/lib/forms";

export function LoginForm({
  action,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state.error} />

      <label className="block">
        <span className="field-label">Usuario o email</span>
        <input
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          className="field"
          placeholder="pepe o pepe@alfocea.es"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="field-label">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <button type="submit" disabled={pending} className={`${BUTTON_STYLES.primary} w-full`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
