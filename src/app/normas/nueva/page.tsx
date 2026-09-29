import { RuleForm } from "@/components/RuleForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";

import { createRule } from "../actions";

export default async function NewRulePage() {
  await requireAdmin();

  return (
    <main className="screen">
      <BackLink href="/normas" label="Normas" />
      <PageHeader title="Nueva norma" />
      <RuleForm action={createRule} submitLabel="Crear norma" cancelHref="/normas" />
    </main>
  );
}
