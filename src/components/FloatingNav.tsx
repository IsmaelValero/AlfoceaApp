import Link from "next/link";

import type { FabIcon } from "@/lib/navigation";

interface FloatingNavProps {
  href: string;
  icon: FabIcon;
  label: string;
  mark?: string;
}

/** Boton circular centrado abajo. El icono indica a donde vuelve. */
export function FloatingNav({ href, icon, label, mark = "?" }: FloatingNavProps) {
  return (
    <Link
      href={href}
      replace
      aria-label={label}
      title={label}
      className={[
        "group absolute bottom-[max(1.15rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2",
        "flex h-14 w-14 items-center justify-center rounded-full",
        "bg-brand-dark text-white shadow-[0_8px_24px_rgb(0_0_0/0.22)]",
        "ring-4 ring-canvas transition",
        "hover:bg-brand active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark",
      ].join(" ")}
    >
      {icon === "initial" ? (
        <span className="text-xl font-bold leading-none">{mark.slice(0, 1).toUpperCase()}</span>
      ) : (
        <FabGlyph icon={icon} />
      )}
    </Link>
  );
}

function FabGlyph({ icon }: { icon: Exclude<FabIcon, "initial"> }) {
  switch (icon) {
    case "home":
      return <HouseGlyph />;
    case "widgets":
      return <WidgetsGlyph />;
    case "book":
      return <BookGlyph />;
    case "calendar":
      return <CalendarGlyph />;
    case "shield":
      return <ShieldGlyph />;
    case "users":
      return <UsersGlyph />;
    case "box":
      return <BoxGlyph />;
    case "tasks":
      return <TasksGlyph />;
  }
}

function HouseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M3.8 11.1 12 4.2l8.2 6.9V19a1.6 1.6 0 0 1-1.6 1.6H5.4A1.6 1.6 0 0 1 3.8 19v-7.9z" fill="currentColor" />
      <path d="M10 20.6v-5.4h4v5.4" fill="var(--color-secondary)" />
    </svg>
  );
}

function WidgetsGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="3" width="7.4" height="7.4" rx="2" fill="currentColor" />
      <rect x="13.6" y="3" width="7.4" height="7.4" rx="2" fill="currentColor" />
      <rect x="3" y="13.6" width="7.4" height="7.4" rx="2" fill="currentColor" />
      <rect x="13.6" y="13.6" width="7.4" height="7.4" rx="2" fill="var(--color-secondary)" />
    </svg>
  );
}

function BookGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M5.5 4.2A2.4 2.4 0 0 1 7.9 2H19v14.5H7.9A2.4 2.4 0 0 0 5.5 18.9V4.2z" fill="currentColor" />
      <path d="M5.5 18.7A2.4 2.4 0 0 1 7.9 16.5H19V22H7.9A2.4 2.4 0 0 1 5.5 19.6v-.9z" fill="var(--color-secondary)" />
      <rect x="9.2" y="5.5" width="6.5" height="1.5" rx="0.75" fill="var(--color-secondary)" />
    </svg>
  );
}

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="3.5" fill="currentColor" />
      <path d="M3.5 9.5h17V8.2A3.5 3.5 0 0 0 17 5H7a3.5 3.5 0 0 0-3.5 3.2v1.3z" fill="var(--color-secondary)" />
      <circle cx="8.2" cy="13.2" r="1.1" fill="#fff" />
      <circle cx="12" cy="13.2" r="1.1" fill="#fff" />
      <circle cx="15.8" cy="13.2" r="1.1" fill="#fff" />
      <circle cx="8.2" cy="16.8" r="1.1" fill="#fff" />
      <circle cx="12" cy="16.8" r="1.1" fill="#fff" />
    </svg>
  );
}

function ShieldGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M12 2.5 20 5.5v5.5c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5.5L12 2.5z" fill="currentColor" />
      <path
        d="m9 12 2.1 2.1L15.4 10"
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <circle cx="15.5" cy="8.2" r="2.4" fill="var(--color-secondary)" />
      <path d="M11.4 18.8c.4-2.7 2-4.2 4.1-4.2s3.7 1.5 4.1 4.2" fill="var(--color-secondary)" />
      <circle cx="9" cy="9" r="3" fill="currentColor" />
      <path d="M3.2 19.2c.5-3.6 2.9-5.4 5.8-5.4s5.3 1.8 5.8 5.4" fill="currentColor" />
    </svg>
  );
}

function BoxGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M12 3.2 20.5 7.5v9L12 20.8 3.5 16.5v-9L12 3.2z" fill="currentColor" />
      <path d="M12 11.5 20.5 7.5 12 3.2 3.5 7.5l8.5 4z" fill="var(--color-secondary)" />
    </svg>
  );
}

function TasksGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="4.5" y="3" width="15" height="18" rx="3.5" fill="currentColor" />
      <path
        d="m8 10.2 1.5 1.5 3-3M8 15.2l1.5 1.5 3-3"
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
