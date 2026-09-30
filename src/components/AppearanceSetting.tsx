"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "alfocea-theme";
type Theme = "anochecer" | "amanecer";

const OPTIONS: { id: Theme; label: string; swatches: [string, string, string] }[] = [
  { id: "anochecer", label: "Anochecer", swatches: ["#7899A8", "#B8CBD2", "#D9A887"] },
  { id: "amanecer", label: "Amanecer", swatches: ["#6F8F7B", "#AFC2B4", "#D6A66B"] },
];

function applyTheme(theme: Theme) {
  if (theme === "amanecer") document.documentElement.dataset.theme = "amanecer";
  else delete document.documentElement.dataset.theme;
  localStorage.setItem(STORAGE_KEY, theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "amanecer" ? "#6F8F7B" : "#7899A8");
}

export function AppearanceSetting() {
  const [theme, setTheme] = useState<Theme>("anochecer");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "amanecer" ? "amanecer" : "anochecer");
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((option) => {
        const selected = theme === option.id;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => choose(option.id)}
            className={[
              "rounded-2xl border px-3 py-3 text-sm font-semibold transition",
              selected ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-surface text-muted",
            ].join(" ")}
          >
            <span className="mb-2 flex justify-center gap-1.5">
              {option.swatches.map((color) => (
                <span key={color} className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
              ))}
            </span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
