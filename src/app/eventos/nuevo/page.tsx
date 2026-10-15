import { redirect } from "next/navigation";

import { EventForm } from "@/components/EventForms";
import { BackLink, PageHeader } from "@/components/ui";
import { canMemberWrite } from "@/lib/authz";
import { getCurrentMember } from "@/lib/queries";

import { createEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const current = await getCurrentMember();
  if (!current) redirect("/login");
  if (!canMemberWrite(current.member)) redirect("/eventos");

  return (
    <main className="screen">
      <BackLink href="/eventos" label="Eventos" />
      <PageHeader title="Nueva celebración" />
      <EventForm action={createEvent} cancelHref="/eventos" />
    </main>
  );
}
