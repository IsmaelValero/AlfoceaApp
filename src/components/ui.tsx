import Link from "next/link";

/* ---------------------------------- Badge ---------------------------------- */

export type BadgeTone = "brand" | "accent" | "warn" | "danger" | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand-dark",
  accent: "bg-accent text-ink",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-sand text-muted",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------- Cabeceras -------------------------------- */

/** Titulo centrado de los modulos, sin subtitulo. */
export function ModuleTitle({ title }: { title: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-center text-[1.75rem] font-bold leading-none tracking-tight text-ink">{title}</h1>
    </header>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <p className="section-title mb-1">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      replace
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-brand"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M19 12H5" />
        <path d="m11 6-6 6 6 6" />
      </svg>
      {label}
    </Link>
  );
}

/* ------------------------------- Estado vacio ------------------------------- */

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card px-5 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* --------------------------------- Botones --------------------------------- */

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

export const BUTTON_STYLES = {
  primary: `${BUTTON_BASE} bg-brand text-white hover:bg-brand-dark`,
  secondary: `${BUTTON_BASE} border border-line bg-surface text-ink hover:border-brand hover:text-brand`,
  danger: `${BUTTON_BASE} border border-danger/30 bg-danger-soft text-danger hover:bg-danger hover:text-white`,
} as const;

export function LinkButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: keyof typeof BUTTON_STYLES;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={BUTTON_STYLES[variant]}>
      {children}
    </Link>
  );
}

/* ------------------------------- Texto largo -------------------------------- */

type Block = { type: "p" | "list"; lines: string[] };

/**
 * Pinta el cuerpo de manuales y normas. Las lineas que empiezan por "- "
 * se agrupan como pasos numerados; el resto son parrafos.
 */
export function RichText({
  content,
  listStyle = "steps",
}: {
  content: string;
  listStyle?: "steps" | "bullets";
}) {
  const blocks: Block[] = [];

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (last?.type === "list") last.lines.push(line.slice(2));
      else blocks.push({ type: "list", lines: [line.slice(2)] });
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) =>
        block.type === "p" ? (
          <p key={index} className="text-[0.9375rem] leading-relaxed text-ink/85">
            {block.lines[0]}
          </p>
        ) : (
          <ol key={index} className="space-y-2.5">
            {block.lines.map((line, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className={
                    listStyle === "steps"
                      ? "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-dark"
                      : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                  }
                  aria-hidden="true"
                >
                  {listStyle === "steps" ? i + 1 : null}
                </span>
                <span className="text-[0.9375rem] leading-relaxed text-ink/85">{line}</span>
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
