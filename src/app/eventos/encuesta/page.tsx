import Link from "next/link";

import { ClosePollForm } from "@/components/EventForms";
import { PollVoteForm } from "@/components/PollVoteForm";
import { BackLink, EmptyState, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { formatBirthday } from "@/lib/birthdays";
import { isSingleDayOption, monthName } from "@/lib/events";
import { getCurrentMember, loadEventBoard } from "@/lib/queries";

import { closePoll, votePoll } from "../actions";

export const dynamic = "force-dynamic";

function peopleLabel(adults: number, children: number) {
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} ${adults === 1 ? "adulto" : "adultos"}`);
  if (children > 0) parts.push(`${children} ${children === 1 ? "niño" : "niños"}`);
  return parts.join(", ") || "0 personas";
}

export default async function PollPage() {
  const [board, current, admin] = await Promise.all([
    loadEventBoard({ ensurePoll: true }),
    getCurrentMember(),
    getAdminSession(),
  ]);
  if (board.missing) {
    return (
      <main className="screen">
        <BackLink href="/eventos" label="Eventos" />
        <EmptyState title="Falta preparar la base de datos" description="Ejecuta supabase/events.sql en el SQL Editor." />
      </main>
    );
  }

  const poll = board.polls.find((item) => item.month === board.month);
  if (!poll) {
    return (
      <main className="screen">
        <BackLink href="/eventos" label="Eventos" />
        <EmptyState title="No hay encuesta este mes" />
      </main>
    );
  }

  const options = board.options
    .filter((option) => option.pollId === poll.id && isSingleDayOption(option))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const votes = board.votes.filter((vote) => vote.pollId === poll.id);
  const ownVotes = current ? votes.filter((vote) => vote.familyId === current.family.id) : [];
  const own = ownVotes[0];
  const ownMember = own ? board.members.find((member) => member.id === own.memberId) : undefined;
  const locked = Boolean(own && current && own.memberId !== current.member.id);
  const monthNumber = Number(board.month.slice(5, 7));
  const birthdays = board.members
    .filter((member) => member.birthMonth === monthNumber && member.birthDay)
    .sort((a, b) => (a.birthDay ?? 0) - (b.birthDay ?? 0) || a.name.localeCompare(b.name));
  const counts: Record<string, number> = {};
  for (const vote of votes) counts[vote.optionId] = (counts[vote.optionId] ?? 0) + 1;
  const leaderId = options.slice().sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))[0]?.id;

  const votesByFamily = new Map<string, typeof votes>();
  for (const vote of votes) {
    const list = votesByFamily.get(vote.familyId) ?? [];
    list.push(vote);
    votesByFamily.set(vote.familyId, list);
  }

  return (
    <main className="screen">
      <BackLink href="/eventos" label="Eventos" />
      <PageHeader title={`Cumpleaños de ${monthName(board.month)}`} subtitle="Un voto por familia · varios días" />

      {birthdays.length > 0 ? (
        <section className="mb-5">
          <h2 className="section-title mb-2">Este mes cumplen</h2>
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

      {poll.status === "cerrada" && poll.eventId ? (
        <Link href={`/eventos/${poll.eventId}`} className="card mb-5 block px-4 py-4 text-sm font-semibold text-brand">
          La encuesta está cerrada. Ver la celebración.
        </Link>
      ) : null}

      {poll.status === "abierta" && locked ? (
        <p className="card mb-5 px-4 py-4 text-sm font-medium text-ink">
          Ya se ha votado por esta familia.
          {ownMember ? ` Lo apuntó ${ownMember.name}` : ""}
          {own
            ? `: ${ownVotes
                .map((vote) => options.find((option) => option.id === vote.optionId)?.label)
                .filter(Boolean)
                .join(", ")}, ${peopleLabel(own.adultsCount, own.childrenCount)}.`
            : ""}
        </p>
      ) : null}

      {poll.status === "abierta" && !locked ? (
        <PollVoteForm
          action={votePoll}
          pollId={poll.id}
          options={options}
          selectedIds={ownVotes.map((vote) => vote.optionId)}
          adultsCount={own?.adultsCount}
          childrenCount={own?.childrenCount}
        />
      ) : null}

      <section className="mt-6">
        <h2 className="section-title mb-2">Votos</h2>
        {votesByFamily.size > 0 ? (
          <ul className="space-y-2">
            {[...votesByFamily.entries()].map(([familyId, familyVotes]) => {
              const family = board.families.find((item) => item.id === familyId);
              const sample = familyVotes[0];
              const labels = familyVotes
                .map((vote) => options.find((item) => item.id === vote.optionId)?.label)
                .filter(Boolean)
                .join(", ");
              return (
                <li key={familyId} className="card px-4 py-3 text-sm">
                  <p className="font-semibold text-ink">{family?.name ?? "Familia"}</p>
                  <p className="mt-0.5 text-muted">
                    {labels}
                    {sample
                      ? ` · ${peopleLabel(sample.adultsCount, sample.childrenCount)}`
                      : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Todavía no ha votado nadie.</p>
        )}
      </section>

      {admin && poll.status === "abierta" ? (
        <section className="mt-6">
          <h2 className="section-title mb-2">Cerrar encuesta</h2>
          <ClosePollForm action={closePoll} pollId={poll.id} options={options} counts={counts} leaderId={leaderId} />
        </section>
      ) : null}
    </main>
  );
}
