import { notFound } from "next/navigation";

import { RuleForm } from "@/components/RuleForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { getRule } from "@/lib/queries";

import { updateRule } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const rule = await getRule(id);
  if (!rule) notFound();

  return (
    <main className="screen">
      <BackLink href={`/normas/${id}`} label="Norma" />
      <PageHeader title="Editar norma" />
      <RuleForm
        action={updateRule.bind(null, id)}
        rule={rule}
        submitLabel="Guardar cambios"
        cancelHref={`/normas/${id}`}
      />
    </main>
  );
}
