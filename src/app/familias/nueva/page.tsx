import { FamilyForm } from "@/components/FamilyForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";

import { createFamily } from "../actions";

export default async function NewFamilyPage() {
  await requireAdmin();

  return (
    <main className="screen">
      <BackLink href="/familias" label="Familias" />
      <PageHeader title="Nueva familia" />
      <FamilyForm action={createFamily} submitLabel="Crear familia" cancelHref="/familias" />
    </main>
  );
}
