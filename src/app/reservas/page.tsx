import { Calendar } from "@/components/Calendar";
import { BackLink, PageHeader } from "@/components/ui";
import { todayKey } from "@/lib/dates";
import { listReservations } from "@/lib/queries";

export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const reservations = await listReservations();
  const today = todayKey();
  const initialDay = dia && DATE_PATTERN.test(dia) ? dia : today;

  return (
    <main className="screen">
      <BackLink href="/modulos" label="Modulos" />

      <PageHeader eyebrow="Reservas" title="Calendario" subtitle="Toca un dia para ver quien lo tiene y a que hora." />

      <Calendar reservations={reservations} today={today} initialDay={initialDay} />
    </main>
  );
}
