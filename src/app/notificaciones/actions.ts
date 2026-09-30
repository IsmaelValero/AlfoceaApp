"use server";

import { revalidatePath } from "next/cache";

import { dismissNotification, markNotificationsRead } from "@/lib/notifications";
import { getCurrentMember } from "@/lib/queries";
import { text } from "@/lib/forms";

export async function markAllNotificationsRead() {
  const current = await getCurrentMember();
  if (!current) return;
  await markNotificationsRead(current.member.id);
  revalidatePath("/");
  revalidatePath("/notificaciones");
  revalidatePath("/modulos");
}

export async function dismissReservationNotification(formData: FormData) {
  const current = await getCurrentMember();
  if (!current) return;

  const id = text(formData, "id");
  if (!id) return;

  await dismissNotification(current.member.id, id);
  revalidatePath("/");
  revalidatePath("/notificaciones");
  revalidatePath("/modulos");
}
