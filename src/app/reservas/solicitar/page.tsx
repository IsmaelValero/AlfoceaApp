import { redirect } from "next/navigation";

import { RequestReservationForm } from "@/components/RequestReservationForm";
import { BackLink, PageHeader } from "@/components/ui";
import { formatLong } from "@/lib/dates";
import { getCurrentMember } from "@/lib/queries";

import { requestReservation } from "../actions";

export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function RequestReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  if (!dia || !DATE_PATTERN.test(dia)) redirect("/reservas");

  const current = await getCurrentMember();
  if (!current) redirect("/reservas");

  return (
    <main className="screen">
      <BackLink href={`/reservas?dia=${dia}`} label="Calendario" />
      <PageHeader eyebrow="Reservas" title="Solicitar reserva" subtitle="La revisara un administrador antes de confirmarla." />
      <RequestReservationForm
        action={requestReservation}
        day={dia}
        dayLabel={formatLong(dia)}
        memberName={current.member.name}
        familyName={current.family.name}
      />
    </main>
  );
}
