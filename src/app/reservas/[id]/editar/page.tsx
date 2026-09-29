import { notFound } from "next/navigation";

import { ReservationForm } from "@/components/ReservationForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { todayKey } from "@/lib/dates";
import { getReservation, listFamiliesWithMembers } from "@/lib/queries";

import { updateReservation } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditReservationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [reservation, families] = await Promise.all([getReservation(id), listFamiliesWithMembers()]);
  if (!reservation) notFound();

  return (
    <main className="screen">
      <BackLink href={`/reservas/${id}`} label="Reserva" />
      <PageHeader title="Editar reserva" />
      <ReservationForm
        families={families}
        action={updateReservation.bind(null, id)}
        reservation={reservation}
        defaultDate={reservation.startDate || todayKey()}
        submitLabel="Guardar cambios"
        cancelHref={`/reservas/${id}`}
      />
    </main>
  );
}
