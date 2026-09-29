"use client";

import { useEffect } from "react";

const MARK_COOKIE = "alfocea_mark";
const ONE_YEAR = 60 * 60 * 24 * 400;

/** Deja la inicial del perfil legible para el boton flotante. */
export function SyncMark({ mark }: { mark: string }) {
  useEffect(() => {
    const value = mark.slice(0, 1).toUpperCase() || "?";
    document.cookie = `${MARK_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
  }, [mark]);
  return null;
}
