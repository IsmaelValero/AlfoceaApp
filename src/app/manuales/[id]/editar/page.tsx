import { redirect } from "next/navigation";

export default async function EditManualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/manuales/${id}`);
}
