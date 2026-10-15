import { EventForm } from "@/components/EventForms";
import { BackLink, PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";

import { createEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireAdmin();
  return (
    <main className="screen">
      <BackLink href="/eventos" label="Eventos" />
      <PageHeader title="Nueva celebración" />
      <EventForm action={createEvent} cancelHref="/eventos" />
    </main>
  );
}
