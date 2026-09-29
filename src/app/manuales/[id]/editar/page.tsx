import { notFound } from "next/navigation";

import { ManualForm } from "@/components/ManualForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { getManual } from "@/lib/queries";

import { updateManual } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditManualPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const manual = await getManual(id);
  if (!manual) notFound();

  return (
    <main className="screen">
      <BackLink href={`/manuales/${id}`} label="Manual" />
      <PageHeader title="Editar manual" />
      <ManualForm
        action={updateManual.bind(null, id)}
        manual={manual}
        submitLabel="Guardar cambios"
        cancelHref={`/manuales/${id}`}
      />
    </main>
  );
}
