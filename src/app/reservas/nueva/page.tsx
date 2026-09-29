import { ReservationForm } from "@/components/ReservationForm";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { todayKey } from "@/lib/dates";
import { listFamiliesWithMembers } from "@/lib/queries";

import { createReservation } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewReservationPage() {
  await requireAdmin();
  const families = await listFamiliesWithMembers();

  return (
    <main className="screen">
      <BackLink href="/reservas" label="Reservas" />
      <PageHeader title="Nueva reserva" />
      <ReservationForm
        families={families}
        action={createReservation}
        defaultDate={todayKey()}
        submitLabel="Crear reserva"
        cancelHref="/reservas"
      />
    </main>
  );
}
