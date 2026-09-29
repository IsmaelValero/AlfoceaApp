"use client";

import { useFormStatus } from "react-dom";

import { BUTTON_STYLES } from "@/components/ui";

/** Boton de envio que pide confirmacion antes de ejecutar una accion destructiva. */
export function ConfirmSubmit({
  message,
  children,
  variant = "danger",
  pendingLabel = "Eliminando...",
}: {
  message: string;
  children: React.ReactNode;
  variant?: keyof typeof BUTTON_STYLES;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={`${BUTTON_STYLES[variant]} w-full`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
