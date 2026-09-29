import { redirect } from "next/navigation";

export default async function EditFamilyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/familias/${id}`);
}
