import { redirect } from "next/navigation";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/reservas/${id}`);
}
