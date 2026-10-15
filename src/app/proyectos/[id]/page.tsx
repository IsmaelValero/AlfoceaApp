import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { Badge, BUTTON_STYLES, EmptyState, PageHeader } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { loadWorkData } from "@/lib/queries";
import { PROJECT_TASK_STATUSES, type ProjectTaskStatus } from "@/lib/types";

import { deleteProject, deleteProjectTask, setProjectTaskStatus } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_TONE = {
  sin_comenzar: "neutral",
  en_curso: "warn",
  terminada: "brand",
} as const;

function statusLabel(status: ProjectTaskStatus) {
  return PROJECT_TASK_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [work, admin] = await Promise.all([loadWorkData(), getAdminSession()]);
  const project = work.projects.find((item) => item.id === id);
  if (!project) {
    if (work.missing) notFound();
    notFound();
  }

  const tasks = work.tasks.filter((task) => task.projectId === project.id);
  const memberName = (memberId: string) => {
    const member = work.members.find((item) => item.id === memberId);
    return member ? [member.name, member.lastName].filter(Boolean).join(" ") : "Alguien";
  };

  return (
    <main className="screen">
      <PageHeader title={project.name} subtitle={project.zone || undefined} />
      {project.description ? (
        <p className="card mb-5 px-4 py-3 text-sm leading-relaxed text-ink">{project.description}</p>
      ) : null}

      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="section-title">Tareas</h2>
        {admin ? (
          <Link href={`/proyectos/${project.id}/tareas/nueva`} className="text-sm font-semibold text-brand hover:underline">
            Nueva tarea
          </Link>
        ) : null}
      </div>

      {tasks.length === 0 ? (
        <EmptyState title="Este proyecto no tiene tareas" />
      ) : (
        <ul className="space-y-2.5">
          {tasks.map((task) => (
            <li key={task.id} className="card px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-ink">{task.title}</p>
                <Badge tone={STATUS_TONE[task.status]}>{statusLabel(task.status)}</Badge>
              </div>
              {task.description ? <p className="mt-1 text-sm text-muted">{task.description}</p> : null}
              <p className="mt-2 text-xs text-muted">
                {task.assigneeIds.map(memberName).join(", ") || "Sin asignar"}
                {task.zone ? ` · ${task.zone}` : ""}
              </p>
              {admin ? (
                <div className="mt-3 space-y-2">
                  <form action={setProjectTaskStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={task.id} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <select name="status" defaultValue={task.status} className="field py-2">
                      {PROJECT_TASK_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className={BUTTON_STYLES.secondary}>
                      Guardar
                    </button>
                  </form>
                  <div className="flex gap-2">
                    <Link href={`/proyectos/${project.id}/tareas/${task.id}/editar`} className={`${BUTTON_STYLES.secondary} flex-1`}>
                      Editar
                    </Link>
                    <form action={deleteProjectTask} className="flex-1">
                      <input type="hidden" name="id" value={task.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <ConfirmSubmit message="¿Eliminar esta tarea?">Eliminar</ConfirmSubmit>
                    </form>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {admin ? (
        <div className="mt-6 space-y-3">
          <Link href={`/proyectos/${project.id}/editar`} className={`${BUTTON_STYLES.secondary} w-full`}>
            Editar proyecto
          </Link>
          <form action={deleteProject}>
            <input type="hidden" name="id" value={project.id} />
            <ConfirmSubmit message="¿Eliminar este proyecto y sus tareas?">Eliminar proyecto</ConfirmSubmit>
          </form>
        </div>
      ) : null}
    </main>
  );
}
