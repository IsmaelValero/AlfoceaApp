import { notFound } from "next/navigation";

import { FamilyForm } from "@/components/FamilyForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { getFamilyWithMembers } from "@/lib/queries";

import { updateFamily } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditFamilyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const family = await getFamilyWithMembers(id);
  if (!family) notFound();

  return (
    <main className="screen">
      <BackLink href={`/familias/${id}`} label="Familia" />
      <PageHeader title="Editar familia" />
      <FamilyForm
        action={updateFamily.bind(null, id)}
        family={family}
        submitLabel="Guardar cambios"
        cancelHref={`/familias/${id}`}
      />
    </main>
  );
}
