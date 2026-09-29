import Link from "next/link";

interface ModuleTileProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Dato en vivo del modulo, p. ej. "3 reservas" */
  meta?: string;
  /** Modulos aun no desarrollados: se ven pero no invitan a entrar */
  soon?: boolean;
  /** Color de la placa del icono */
  tone?: "sea" | "sand";
}

export function ModuleTile({ href, title, description, icon, meta, soon = false, tone = "sea" }: ModuleTileProps) {
  return (
    <Link
      href={href}
      className={[
        "card flex flex-col gap-3 p-4 transition",
        soon
          ? "opacity-70 hover:opacity-100"
          : "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md active:translate-y-0",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-12 w-12 items-center justify-center rounded-2xl",
          tone === "sand" ? "bg-accent-soft" : "bg-brand-soft",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="font-bold text-ink">{title}</span>
          {soon ? (
            <span className="rounded-full bg-sand px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-muted">
              Pronto
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{description}</span>
      </span>

      {meta ? <span className="mt-auto text-xs font-semibold text-brand">{meta}</span> : null}
    </Link>
  );
}
