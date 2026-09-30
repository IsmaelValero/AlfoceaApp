"use client";

import { useEffect } from "react";

import { markAllNotificationsRead } from "@/app/notificaciones/actions";

/** Marca avisos como leidos al entrar (fuera del render del servidor). */
export function MarkNotificationsRead() {
  useEffect(() => {
    void markAllNotificationsRead();
  }, []);

  return null;
}
