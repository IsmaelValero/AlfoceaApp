"use client";

import { useEffect, useState } from "react";

export function BootScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1100);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="boot-screen" role="status" aria-live="polite" aria-label="Cargando Alfocea">
      <p>Alfocea</p>
      <span className="boot-bar" aria-hidden="true" />
    </div>
  );
}
