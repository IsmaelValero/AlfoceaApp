import { ManualForm } from "@/components/ManualForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";

import { createManual } from "../actions";

export default async function NewManualPage() {
  await requireAdmin();

  return (
    <main className="screen">
      <BackLink href="/manuales" label="Manuales" />
      <PageHeader title="Nuevo manual" />
      <ManualForm action={createManual} submitLabel="Crear manual" cancelHref="/manuales" />
    </main>
  );
}
