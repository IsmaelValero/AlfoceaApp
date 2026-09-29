import { notFound } from "next/navigation";

import { RulePriorityBadge } from "@/components/RuleBadge";
import { Badge, BackLink, PageHeader, RichText } from "@/components/ui";
import { getRule } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rule = await getRule(id);

  if (!rule) notFound();

  return (
    <main className="screen">
      <BackLink href="/normas" label="Normas" />

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="brand">{rule.category}</Badge>
        <RulePriorityBadge priority={rule.priority} />
      </div>

      <PageHeader title={rule.title} />

      <article className="card p-5">
        <RichText content={rule.content} listStyle="bullets" />
      </article>
    </main>
  );
}
