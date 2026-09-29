"use server";

import { revalidatePath } from "next/cache";
import { RedirectType, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { formatRange } from "@/lib/dates";
import { text, type FormState } from "@/lib/forms";
import { DAY_CLOSE, DAY_OPEN, formatHours, isTime } from "@/lib/hours";
import { findOverlapping, getCurrentMember } from "@/lib/queries";
import {
  RESERVATION_STATUSES,
  RESERVATION_ZONES,
  type Reservation,
  type ReservationStatus,
  type ReservationZone,
} from "@/lib/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const STATUS_VALUES = RESERVATION_STATUSES.map((status) => status.value);

function refresh(id?: string) {
  revalidatePath("/");
  revalidatePath("/modulos");
  revalidatePath("/reservas");
  revalidatePath("/notificaciones");
  if (id) revalidatePath(`/reservas/${id}`);
}

/** Valida el formulario y devuelve o bien el error o bien los datos limpios. */
async function parseForm(
  formData: FormData,
  excludeId?: string,
): Promise<{ error: string } | { data: Omit<Reservation, "id" | "createdAt"> }> {
  const title = text(formData, "title");
  const familyId = text(formData, "familyId");
  const memberId = text(formData, "memberId");
  const zone = text(formData, "zone") as ReservationZone;
  const startDate = text(formData, "startDate");
  const endDate = text(formData, "endDate") || startDate;
  const guests = Number.parseInt(text(formData, "guests"), 10);
  const status = (text(formData, "status") || "pendiente") as ReservationStatus;
  const notes = text(formData, "notes");

  if (!title) return { error: "Ponle un titulo a la reserva." };
  if (!familyId) return { error: "Elige que familia reserva." };
  if (!RESERVATION_ZONES.includes(zone)) return { error: "Elige una zona del terreno." };
  if (!STATUS_VALUES.includes(status)) return { error: "Ese estado de reserva no existe." };
  if (!DATE_PATTERN.test(startDate)) return { error: "La fecha de inicio no es valida." };
  if (!DATE_PATTERN.test(endDate)) return { error: "La fecha de fin no es valida." };
  if (endDate < startDate) return { error: "La fecha de fin no puede ser anterior a la de inicio." };
  if (!Number.isFinite(guests) || guests < 1) return { error: "Indica cuantas personas vienen (minimo 1)." };

  if (!(await db.families.get(familyId))) return { error: "Esa familia ya no existe." };

  if (status !== "cancelada") {
    const conflicts = await findOverlapping(startDate, endDate, zone, excludeId);
    if (conflicts.length > 0) {
      const clash = conflicts[0];
      return {
        error: `"${clash.title}" ya ocupa ${zone} el ${formatRange(clash.startDate, clash.endDate)}. Cambia las fechas o la zona.`,
      };
    }
  }

  return {
    data: {
      title,
      familyId,
      memberId: memberId || undefined,
      zone,
      startDate,
      endDate,
      guests,
      status,
      notes: notes || undefined,
    },
  };
}

export async function requestReservation(_prevState: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentMember();
  if (!current) return { error: "No hay un usuario activo para pedir la reserva." };

  const day = text(formData, "day");
  const startTime = text(formData, "startTime");
  const endTime = text(formData, "endTime");
  const guests = Number.parseInt(text(formData, "guests"), 10);
  const eventType = text(formData, "eventType");
  const zone = text(formData, "zone") as ReservationZone;

  if (!DATE_PATTERN.test(day)) return { error: "El dia de la reserva no es valido." };
  if (!isTime(startTime) || !isTime(endTime)) return { error: "Indica la hora de inicio y la de fin." };
  if (endTime <= startTime) return { error: "La hora de fin tiene que ser posterior a la de inicio." };
  if (startTime < DAY_OPEN || endTime > DAY_CLOSE) {
    return { error: `Se puede reservar entre las ${DAY_OPEN} y las ${DAY_CLOSE}.` };
  }
  if (!eventType) return { error: "Indica el tipo de evento." };
  if (!RESERVATION_ZONES.includes(zone)) return { error: "Elige Zona 1 o Zona 2." };
  if (!Number.isFinite(guests) || guests < 1) return { error: "Indica cuantas personas vienen (minimo 1)." };

  const conflicts = await findOverlapping(day, day, zone, undefined, startTime, endTime);
  if (conflicts.length > 0) {
    const clash = conflicts[0];
    return {
      error: `${zone} ya esta ocupada de ${formatHours(clash.startTime, clash.endTime)}. Prueba otra hora o la otra zona.`,
    };
  }

  await db.reservations.create({
    title: eventType,
    familyId: current.member.familyId,
    memberId: current.member.id,
    zone,
    startDate: day,
    endDate: day,
    startTime,
    endTime,
    guests,
    status: "pendiente",
    createdAt: new Date().toISOString(),
  });

  refresh();
  redirect(`/reservas?dia=${day}`, RedirectType.replace);
}

export async function createReservation(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = await parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const created = await db.reservations.create({ ...parsed.data, createdAt: new Date().toISOString() });
  refresh(created.id);
  // redirect lanza una excepcion de control, por eso va fuera de cualquier try.
  redirect(`/reservas/${created.id}`);
}

export async function updateReservation(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = await parseForm(formData, id);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.reservations.update(id, parsed.data);
  if (!updated) return { error: "Esta reserva ya no existe." };

  refresh(id);
  redirect(`/reservas/${id}`);
}

export async function setReservationStatus(formData: FormData) {
  const id = text(formData, "id");
  const status = text(formData, "status") as ReservationStatus;
  if (!STATUS_VALUES.includes(status)) return;

  await db.reservations.update(id, { status });
  refresh(id);
}

export async function deleteReservation(formData: FormData) {
  await db.reservations.remove(text(formData, "id"));
  refresh();
  redirect("/reservas");
}
