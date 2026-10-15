import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { FoodForm, RsvpForm } from "@/components/EventForms";
import { BackLink, Badge, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { formatBirthday } from "@/lib/birthdays";
import { formatLong, formatRange } from "@/lib/dates";
import { getCurrentMember, loadEventBoard } from "@/lib/queries";
import { RSVP_STATUSES } from "@/lib/types";

import { addEventItem, answerEvent, deleteEvent, removeEventItem } from "../actions";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [board, current, admin] = await Promise.all([loadEventBoard(), getCurrentMember(), getAdminSession()]);
  if (board.missing) notFound();
  const event = board.events.find((item) => item.id === id);
  if (!event) notFound();

  const rsvps = board.rsvps.filter((rsvp) => rsvp.eventId === event.id);
  const items = board.items
    .filter((item) => item.eventId === event.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const own = current ? rsvps.find((rsvp) => rsvp.familyId === current.family.id) : undefined;
  const locked = Boolean(own && current && own.memberId !== current.member.id);
  const ownMember = own ? board.members.find((member) => member.id === own.memberId) : undefined;
  const coming = rsvps.filter((rsvp) => rsvp.status === "voy").reduce((sum, rsvp) => sum + rsvp.peopleCount, 0);
  const monthNumber = event.month ? Number(event.month.slice(5, 7)) : null;
  const birthdays =
    monthNumber === null
      ? []
      : board.members
          .filter((member) => member.birthMonth === monthNumber && member.birthDay)
          .sort((a, b) => (a.birthDay ?? 0) - (b.birthDay ?? 0) || a.name.localeCompare(b.name));

  return (
    <main className="screen">
      <BackLink href="/eventos" label="Eventos" />
      <PageHeader
        title={event.title}
        subtitle={event.startDate === event.endDate ? formatLong(event.startDate) : formatRange(event.startDate, event.endDate)}
      />
      {event.place ? <p className="mb-3 text-sm text-muted">{event.place}</p> : null}
      {event.notes ? <p className="mb-5 text-sm leading-relaxed text-ink/85">{event.notes}</p> : null}

      {birthdays.length > 0 ? (
        <section className="mb-6">
          <h2 className="section-title mb-2">Cumplen</h2>
          <ul className="card divide-y divide-line px-4">
            {birthdays.map((member) => (
              <li key={member.id} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                <span className="font-semibold text-ink">{member.name}</span>
                <span className="text-muted">{formatBirthday(member)}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mb-6">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="section-title">Quién viene</h2>
          <Badge tone="brand">{coming} personas</Badge>
        </div>
        {locked ? (
          <p className="card mb-3 px-4 py-4 text-sm font-medium text-ink">
            Ya ha contestado esta familia.
            {ownMember ? ` Lo apuntó ${ownMember.name}` : ""}
            {own ? `: ${RSVP_STATUSES.find((item) => item.value === own.status)?.label ?? ""}.` : ""}
            {own && own.peopleCount > 0 ? ` ${own.peopleCount} personas.` : ""}
          </p>
        ) : (
          <div className="card mb-3 px-4 py-4">
            <RsvpForm action={answerEvent} eventId={event.id} status={own?.status} peopleCount={own?.peopleCount} />
          </div>
        )}
        {rsvps.length > 0 ? (
          <ul className="space-y-2">
            {rsvps.map((rsvp) => {
              const family = board.families.find((item) => item.id === rsvp.familyId);
              const label = RSVP_STATUSES.find((item) => item.value === rsvp.status)?.label ?? rsvp.status;
              return (
                <li key={rsvp.id} className="card flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-semibold text-ink">{family?.name ?? "Familia"}</span>
                  <span className="text-muted">
                    {label}
                    {rsvp.status === "voy" ? ` · ${rsvp.peopleCount}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nadie ha confirmado todavía.</p>
        )}
      </section>

      <section className="mb-6">
        <h2 className="section-title mb-2">La comida</h2>
        {items.length > 0 ? (
          <ul className="mb-3 space-y-2">
            {items.map((item) => {
              const member = item.memberId ? board.members.find((person) => person.id === item.memberId) : undefined;
              const canRemove = Boolean(admin || (current && item.memberId === current.member.id));
              return (
                <li key={item.id} className="card px-4 py-3">
                  <p className="font-semibold text-ink">{item.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {item.quantity}
                    {member ? ` · ${member.name}` : ""}
                  </p>
                  {canRemove ? (
                    <form action={removeEventItem} className="mt-2">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="eventId" value={event.id} />
                      <ConfirmSubmit message={`¿Quitar ${item.name}?`}>Quitar</ConfirmSubmit>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-muted">Todavía no hay nada apuntado. Cada uno añade lo que lleva.</p>
        )}
        <div className="card px-4 py-4">
          <FoodForm action={addEventItem} eventId={event.id} />
        </div>
      </section>

      {admin ? (
        <form action={deleteEvent}>
          <input type="hidden" name="id" value={event.id} />
          <ConfirmSubmit message={`¿Eliminar ${event.title}?`}>Eliminar celebración</ConfirmSubmit>
        </form>
      ) : null}
    </main>
  );
}
