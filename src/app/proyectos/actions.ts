"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canMemberWrite, getAdminSession } from "@/lib/authz";
import { db } from "@/lib/db";
import { text, type FormState } from "@/lib/forms";
import { todayKey } from "@/lib/dates";
import { getCurrentMember } from "@/lib/queries";
import {
  PROJECT_TASK_STATUSES,
  type ProjectTaskStatus,
  type RecurrenceKind,
} from "@/lib/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: RecurrenceKind[] = ["weekly", "every_other_day", "every_n_days", "monthly"];
const STATUSES = PROJECT_TASK_STATUSES.map((item) => item.value);

function refresh(paths: string[] = []) {
  revalidatePath("/");
  revalidatePath("/modulos");
  revalidatePath("/proyectos");
  revalidatePath("/reservas");
  for (const path of paths) revalidatePath(path);
}

function parseProject(formData: FormData) {
  const name = text(formData, "name");
  const description = text(formData, "description");
  const zone = text(formData, "zone");
  if (!name) return { error: "El proyecto necesita un nombre." };
  return { data: { name, description, zone } };
}

function parseAssignees(formData: FormData) {
  return formData
    .getAll("assigneeIds")
    .map((value) => value.toString())
    .filter(Boolean);
}

function parseTask(formData: FormData, projectId: string) {
  const title = text(formData, "title");
  const description = text(formData, "description");
  const zone = text(formData, "zone");
  const status = text(formData, "status") as ProjectTaskStatus;
  const assigneeIds = parseAssignees(formData);

  if (!title) return { error: "La tarea necesita un titulo." };
  if (!STATUSES.includes(status)) return { error: "Elige un estado." };
  if (assigneeIds.length === 0) return { error: "Asigna la tarea al menos a una persona." };

  return { data: { projectId, title, description, zone, status, assigneeIds } };
}

function parseRecurring(formData: FormData) {
  const title = text(formData, "title");
  const zone = text(formData, "zone");
  const manualId = text(formData, "manualId");
  const kind = text(formData, "kind") as RecurrenceKind;
  const allowDone = text(formData, "allowDone") === "si";

  if (!title) return { error: "La tarea necesita un titulo." };
  if (!KINDS.includes(kind)) return { error: "Elige cada cuanto se repite." };

  let interval = 1;
  let weekdays: number[] = [];
  let monthDay: number | undefined;

  if (kind === "weekly") {
    weekdays = formData
      .getAll("weekdays")
      .map((value) => Number(value))
      .filter((value) => value >= 0 && value <= 6);
    interval = Math.max(1, Number(text(formData, "interval")) || 1);
    if (weekdays.length === 0) return { error: "Elige al menos un dia de la semana." };
  } else if (kind === "every_n_days") {
    interval = Math.max(1, Number(text(formData, "interval")) || 1);
  } else if (kind === "monthly") {
    monthDay = Number(text(formData, "monthDay"));
    if (!Number.isInteger(monthDay) || monthDay < 1 || monthDay > 31) {
      return { error: "El dia del mes tiene que estar entre 1 y 31." };
    }
  }

  return {
    data: {
      title,
      zone,
      manualId: manualId || undefined,
      kind,
      interval,
      weekdays,
      monthDay,
      allowDone,
    },
  };
}

export async function createProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear proyectos." };
  const parsed = parseProject(formData);
  if ("error" in parsed) return { error: parsed.error };

  const now = new Date().toISOString();
  const created = await db.projects.create({ ...parsed.data, createdAt: now, updatedAt: now });
  refresh([`/proyectos/${created.id}`]);
  redirect(`/proyectos/${created.id}`);
}

export async function updateProject(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar proyectos." };
  const parsed = parseProject(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.projects.update(id, { ...parsed.data, updatedAt: new Date().toISOString() });
  if (!updated) return { error: "Ese proyecto ya no existe." };
  refresh([`/proyectos/${id}`]);
  redirect(`/proyectos/${id}`);
}

export async function deleteProject(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;
  const id = text(formData, "id");
  const tasks = await db.projectTasks.list();
  for (const task of tasks.filter((item) => item.projectId === id)) {
    await db.projectTasks.remove(task.id);
  }
  await db.projects.remove(id);
  refresh();
  redirect("/proyectos");
}

export async function createProjectTask(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear tareas." };
  const parsed = parseTask(formData, projectId);
  if ("error" in parsed) return { error: parsed.error };

  await db.projectTasks.create({ ...parsed.data, createdAt: new Date().toISOString() });
  await db.projects.update(projectId, { updatedAt: new Date().toISOString() });
  refresh([`/proyectos/${projectId}`]);
  redirect(`/proyectos/${projectId}`);
}

export async function updateProjectTask(
  projectId: string,
  taskId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar tareas." };
  const parsed = parseTask(formData, projectId);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.projectTasks.update(taskId, parsed.data);
  if (!updated) return { error: "Esa tarea ya no existe." };
  refresh([`/proyectos/${projectId}`]);
  redirect(`/proyectos/${projectId}`);
}

export async function setProjectTaskStatus(formData: FormData) {
  const current = await getCurrentMember();
  if (!current || !canMemberWrite(current.member)) return;
  const admin = await getAdminSession();
  const id = text(formData, "id");
  const projectId = text(formData, "projectId");
  const status = text(formData, "status") as ProjectTaskStatus;
  if (!STATUSES.includes(status)) return;
  const task = await db.projectTasks.get(id);
  if (!task || task.projectId !== projectId) return;
  if (!admin && !task.assigneeIds.includes(current.member.id)) return;
  await db.projectTasks.update(id, { status });
  refresh([`/proyectos/${projectId}`]);
}

export async function deleteProjectTask(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;
  const id = text(formData, "id");
  const projectId = text(formData, "projectId");
  await db.projectTasks.remove(id);
  refresh([`/proyectos/${projectId}`]);
  redirect(`/proyectos/${projectId}`);
}

export async function createRecurringTask(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede crear tareas periodicas." };
  const parsed = parseRecurring(formData);
  if ("error" in parsed) return { error: parsed.error };

  const created = await db.recurringTasks.create({
    ...parsed.data,
    startDate: todayKey(),
    endDate: null,
    createdAt: new Date().toISOString(),
  });
  refresh([`/proyectos/periodicas/${created.id}`]);
  redirect(`/proyectos/periodicas/${created.id}`);
}

export async function updateRecurringTask(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Solo un administrador puede editar tareas periodicas." };
  const parsed = parseRecurring(formData);
  if ("error" in parsed) return { error: parsed.error };

  const updated = await db.recurringTasks.update(id, { ...parsed.data, endDate: null });
  if (!updated) return { error: "Esa tarea ya no existe." };
  refresh([`/proyectos/periodicas/${id}`]);
  redirect(`/proyectos/periodicas/${id}`);
}

export async function deleteRecurringTask(formData: FormData) {
  const admin = await getAdminSession();
  if (!admin) return;
  const id = text(formData, "id");
  const completions = await db.recurringCompletions.list();
  for (const completion of completions.filter((item) => item.taskId === id)) {
    await db.recurringCompletions.remove(completion.id);
  }
  await db.recurringTasks.remove(id);
  refresh();
  redirect("/proyectos");
}

export async function toggleRecurringDone(formData: FormData) {
  const current = await getCurrentMember();
  if (!current || !canMemberWrite(current.member)) return;

  const taskId = text(formData, "taskId");
  const date = text(formData, "date");
  if (!DATE_PATTERN.test(date)) return;

  const task = await db.recurringTasks.get(taskId);
  if (!task?.allowDone) return;

  const completions = await db.recurringCompletions.list();
  const existing = completions.find((item) => item.taskId === taskId && item.date === date);
  try {
    if (existing) {
      await db.recurringCompletions.remove(existing.id);
    } else {
      await db.recurringCompletions.create({
        taskId,
        date,
        memberId: current.member.id,
        completedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    const code = error && typeof error === "object" ? (error as { code?: string }).code : undefined;
    if (code !== "23505") throw error;
  }
  refresh([`/proyectos/periodicas/${taskId}`]);
}
