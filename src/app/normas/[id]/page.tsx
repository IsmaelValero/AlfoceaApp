import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { RulePriorityBadge } from "@/components/RuleBadge";
import { Badge, BUTTON_STYLES, PageHeader, RichText } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { getRule } from "@/lib/queries";

import { deleteRule, toggleRulePinned } from "../actions";

export const dynamic = "force-dynamic";

export default async function RuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rule, admin] = await Promise.all([getRule(id), getAdminSession()]);

  if (!rule) notFound();

  return (
    <main className="screen">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{rule.category}</Badge>
        <RulePriorityBadge priority={rule.priority} />
      </div>

      <PageHeader title={rule.title} />

      <article className="card p-5">
        <RichText content={rule.content} listStyle="bullets" />
      </article>

      {admin ? (
        <div className="mt-6 space-y-3">
          <Link href={`/normas/${rule.id}/editar`} className={`${BUTTON_STYLES.secondary} w-full`}>
            Editar norma
          </Link>
          <form action={toggleRulePinned}>
            <input type="hidden" name="id" value={rule.id} />
            <button type="submit" className={`${BUTTON_STYLES.secondary} w-full`}>
              {rule.pinned ? "Quitar de Inicio" : "Destacar en Inicio"}
            </button>
          </form>
          <form action={deleteRule}>
            <input type="hidden" name="id" value={rule.id} />
            <ConfirmSubmit message="¿Eliminar esta norma?">Eliminar</ConfirmSubmit>
          </form>
        </div>
      ) : null}
    </main>
  );
}
