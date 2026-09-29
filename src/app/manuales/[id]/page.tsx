import { notFound } from "next/navigation";

import { Badge, BackLink, PageHeader, RichText } from "@/components/ui";
import { getManual } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ManualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manual = await getManual(id);

  if (!manual) notFound();

  return (
    <main className="screen">
      <BackLink href="/manuales" label="Manuales" />

      <div className="mb-2">
        <Badge tone="brand">{manual.category}</Badge>
      </div>

      <PageHeader title={manual.title} subtitle={manual.summary} />

      <article className="card p-5">
        <RichText content={manual.content} listStyle="steps" />
      </article>
    </main>
  );
}
