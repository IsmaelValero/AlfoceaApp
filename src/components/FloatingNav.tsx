import Link from "next/link";

interface FloatingNavProps {
  href: string;
  /** Icono del boton segun la pantalla en la que estas. */
  icon: "home" | "widgets";
  label: string;
}

/**
 * Boton circular centrado abajo.
 * En Inicio muestra la cuadricula de Widgets y en Widgets, la casa.
 */
export function FloatingNav({ href, icon, label }: FloatingNavProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={[
        "group absolute bottom-[max(1.15rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2",
        "flex h-14 w-14 items-center justify-center rounded-full",
        "bg-ink text-white shadow-[0_8px_24px_rgba(18,59,82,0.28)]",
        "ring-4 ring-canvas transition",
        "hover:bg-brand active:scale-95",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark",
      ].join(" ")}
    >
      {icon === "home" ? <HouseGlyph /> : <WidgetsGlyph />}
    </Link>
  );
}

function HouseGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M3.8 11.1 12 4.2l8.2 6.9V19a1.6 1.6 0 0 1-1.6 1.6H5.4A1.6 1.6 0 0 1 3.8 19v-7.9z" fill="currentColor" />
      <path d="M10 20.6v-5.4h4v5.4" fill="#D8B27C" />
    </svg>
  );
}

function WidgetsGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="3" width="7.4" height="7.4" rx="2" fill="currentColor" />
      <rect x="13.6" y="3" width="7.4" height="7.4" rx="2" fill="currentColor" />
      <rect x="3" y="13.6" width="7.4" height="7.4" rx="2" fill="currentColor" />
      <rect x="13.6" y="13.6" width="7.4" height="7.4" rx="2" fill="#D8B27C" />
    </svg>
  );
}
