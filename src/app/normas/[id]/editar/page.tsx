import { redirect } from "next/navigation";

export default async function EditRulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/normas/${id}`);
}
