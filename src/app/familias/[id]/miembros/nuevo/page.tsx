import { MemberForm } from "@/components/MemberForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { getFamilyWithMembers } from "@/lib/queries";
import { notFound } from "next/navigation";

import { createMember } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function NewMemberPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const family = await getFamilyWithMembers(id);
  if (!family) notFound();

  return (
    <main className="screen">
      <BackLink href={`/familias/${id}`} label={family.name} />
      <PageHeader title="Nueva persona" />
      <MemberForm action={createMember} familyId={id} submitLabel="Anadir persona" cancelHref={`/familias/${id}`} />
    </main>
  );
}
