"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { monthName } from "@/lib/events";
import { text, type FormState } from "@/lib/forms";
import { getCurrentMember } from "@/lib/queries";
import { EVENT_KINDS, RSVP_STATUSES, type EventKind, type RsvpStatus } from "@/lib/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function refresh(eventId?: string) {
  revalidatePath("/");
  revalidatePath("/modulos");
  revalidatePath("/eventos");
  revalidatePath("/eventos/encuesta");
  if (eventId) revalidatePath(`/eventos/${eventId}`);
}

function familyAlreadyAnswered(memberId: string, existingMemberId: string) {
  return existingMemberId !== memberId;
}

export async function votePoll(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentMember();
  if (!current) return { error: "Tienes que entrar." };

  const pollId = text(formData, "pollId");
  const optionId = text(formData, "optionId");
  const peopleCount = Number(text(formData, "peopleCount"));
  if (!pollId || !optionId) return { error: "Elige un sábado, un domingo o un finde." };
  if (!Number.isInteger(peopleCount) || peopleCount < 1) {
    return { error: "Indica cuántas personas podéis subir." };
  }

  const [poll, option, votes] = await Promise.all([
    db.polls.get(pollId),
    db.pollOptions.get(optionId),
    db.pollVotes.list(),
  ]);
  if (!poll || poll.status !== "abierta") return { error: "Esta encuesta ya está cerrada." };
  if (!option || option.pollId !== poll.id) return { error: "Esa fecha no está en la encuesta." };

  const existing = votes.find((vote) => vote.pollId === poll.id && vote.familyId === current.family.id);
  if (existing && familyAlreadyAnswered(current.member.id, existing.memberId)) {
    return { error: "Ya se ha votado por esta familia." };
  }

  if (existing) {
    await db.pollVotes.update(existing.id, { optionId, peopleCount, memberId: current.member.id });
  } else {
    await db.pollVotes.create({
      pollId: poll.id,
      optionId,
      familyId: current.family.id,
      memberId: current.member.id,
      peopleCount,
      createdAt: new Date().toISOString(),
    });
  }

  refresh();
  redirect("/eventos/encuesta");
}

export async function closePoll(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede cerrar la encuesta." };

  const pollId = text(formData, "pollId");
  const optionId = text(formData, "optionId");
  const [poll, option, votes] = await Promise.all([
    db.polls.get(pollId),
    db.pollOptions.get(optionId),
    db.pollVotes.list(),
  ]);
  if (!poll || poll.status !== "abierta") return { error: "Esta encuesta ya está cerrada." };
  if (!option || option.pollId !== poll.id) return { error: "Elige la fecha ganadora." };

  const event = await db.events.create({
    title: `Cumpleaños de ${monthName(poll.month)}`,
    kind: "cumpleanos_mes",
    startDate: option.startDate,
    endDate: option.endDate,
    month: poll.month,
    pollId: poll.id,
    createdAt: new Date().toISOString(),
  });

  const winners = votes.filter((vote) => vote.pollId === poll.id && vote.optionId === option.id);
  await Promise.all(
    winners.map((vote) =>
      db.eventRsvps.create({
        eventId: event.id,
        familyId: vote.familyId,
        memberId: vote.memberId,
        status: "voy",
        peopleCount: vote.peopleCount,
        createdAt: new Date().toISOString(),
      }),
    ),
  );

  await db.polls.update(poll.id, { status: "cerrada", eventId: event.id });
  refresh(event.id);
  redirect(`/eventos/${event.id}`);
}

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear celebraciones." };

  const title = text(formData, "title");
  const kind = text(formData, "kind") as EventKind;
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate") || startDate;
  const place = text(formData, "place");
  const notes = text(formData, "notes");
  const kinds = EVENT_KINDS.map((item) => item.value);

  if (!title) return { error: "La celebración necesita un nombre." };
  if (!kinds.includes(kind as (typeof kinds)[number])) return { error: "Elige el tipo." };
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate) || endDate < startDate) {
    return { error: "Revisa las fechas." };
  }

  const event = await db.events.create({
    title,
    kind,
    startDate,
    endDate,
    place: place || undefined,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
  });
  refresh(event.id);
  redirect(`/eventos/${event.id}`);
}

export async function answerEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentMember();
  if (!current) return { error: "Tienes que entrar." };

  const eventId = text(formData, "eventId");
  const status = text(formData, "status") as RsvpStatus;
  const rawCount = text(formData, "peopleCount");
  const peopleCount = status === "no_voy" ? 0 : Number(rawCount);
  if (!RSVP_STATUSES.some((item) => item.value === status)) return { error: "Indica si venís." };
  if (status !== "no_voy" && (!Number.isInteger(peopleCount) || peopleCount < 1)) {
    return { error: "Indica cuántas personas venís." };
  }

  const event = await db.events.get(eventId);
  if (!event) return { error: "Esa celebración ya no existe." };

  const rsvps = await db.eventRsvps.list();
  const existing = rsvps.find((rsvp) => rsvp.eventId === event.id && rsvp.familyId === current.family.id);
  if (existing && familyAlreadyAnswered(current.member.id, existing.memberId)) {
    return { error: "Ya ha contestado esta familia." };
  }

  if (existing) {
    await db.eventRsvps.update(existing.id, { status, peopleCount, memberId: current.member.id });
  } else {
    await db.eventRsvps.create({
      eventId: event.id,
      familyId: current.family.id,
      memberId: current.member.id,
      status,
      peopleCount,
      createdAt: new Date().toISOString(),
    });
  }

  refresh(event.id);
  redirect(`/eventos/${event.id}`);
}

export async function addEventItem(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentMember();
  if (!current) return { error: "Tienes que entrar." };

  const eventId = text(formData, "eventId");
  const name = text(formData, "name");
  const quantity = text(formData, "quantity");
  if (!name) return { error: "Escribe qué llevas." };
  if (!quantity) return { error: "Indica la cantidad." };

  const event = await db.events.get(eventId);
  if (!event) return { error: "Esa celebración ya no existe." };

  await db.eventItems.create({
    eventId: event.id,
    name,
    quantity,
    memberId: current.member.id,
    createdAt: new Date().toISOString(),
  });
  refresh(event.id);
  redirect(`/eventos/${event.id}`);
}

export async function removeEventItem(formData: FormData) {
  const current = await getCurrentMember();
  if (!current) return;
  const admin = await getAdminSession();
  const id = text(formData, "id");
  const eventId = text(formData, "eventId");
  const item = await db.eventItems.get(id);
  if (!item || item.eventId !== eventId) return;
  if (item.memberId !== current.member.id && !admin) return;
  await db.eventItems.remove(id);
  refresh(eventId);
  redirect(`/eventos/${eventId}`);
}

export async function deleteEvent(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;
  const id = text(formData, "id");
  await db.events.remove(id);
  refresh();
  redirect("/eventos");
}
