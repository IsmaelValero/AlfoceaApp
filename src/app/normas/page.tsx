import Link from "next/link";

import { RulePriorityBadge } from "@/components/RuleBadge";
import { BackLink, EmptyState, PageHeader } from "@/components/ui";
import { listRules } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const rules = await listRules();

  return (
    <main className="screen">
      <BackLink href="/modulos" label="Modulos" />

      <PageHeader
        eyebrow="Normas de uso"
        title="Como nos organizamos"
        subtitle="Los acuerdos que hacen que todo funcione."
      />

      {rules.length === 0 ? (
        <EmptyState title="Aun no hay normas" description="Cuando se publiquen, podras leerlas aqui." />
      ) : (
        <ul className="space-y-2.5">
          {rules.map((rule) => (
            <li key={rule.id}>
              <Link
                href={`/normas/${rule.id}`}
                className="card block px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-ink">{rule.title}</p>
                  <RulePriorityBadge priority={rule.priority} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{rule.content}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="font-semibold text-ink/70">{rule.category}</span>
                  {rule.pinned ? (
                    <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-ink">Destacada en Inicio</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
