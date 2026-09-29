import { notFound } from "next/navigation";

import { MemberForm } from "@/components/MemberForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { getFamilyWithMembers, getMember } from "@/lib/queries";

import { updateMember } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string; memberId: string }>;
}) {
  await requireAdmin();
  const { id, memberId } = await params;
  const [family, member] = await Promise.all([getFamilyWithMembers(id), getMember(memberId)]);

  if (!family || !member || member.familyId !== id) notFound();

  return (
    <main className="screen">
      <BackLink href={`/familias/${id}`} label={family.name} />
      <PageHeader title={`Editar a ${member.name}`} />
      <MemberForm
        action={updateMember.bind(null, memberId)}
        familyId={id}
        member={member}
        submitLabel="Guardar cambios"
        cancelHref={`/familias/${id}`}
      />
    </main>
  );
}
