import Link from "next/link";

import { AdminCreateLink } from "@/components/AdminLinks";
import { Badge, EmptyState, ModuleTitle } from "@/components/ui";
import { formatRange } from "@/lib/dates";
import { describeRecurrence } from "@/lib/recurrence";
import { getAdminSession } from "@/lib/authz";
import { loadWorkData } from "@/lib/queries";
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [work, admin] = await Promise.all([loadWorkData(), getAdminSession()]);

  return (
    <main className="screen">
      <ModuleTitle title="Proyectos y tareas" />

      {work.missing ? (
        <EmptyState
          title="Falta preparar la base de datos"
          description="Ejecuta supabase/projects.sql en el SQL Editor de Supabase y vuelve a cargar."
        />
      ) : (
        <>
          {admin ? <AdminCreateLink href="/proyectos/nuevo" label="Nuevo proyecto" /> : null}

          <section className="mb-8">
            <h2 className="section-title mb-2">Proyectos</h2>
            {work.projects.length === 0 ? (
              <EmptyState title="Aun no hay proyectos" description="Las obras y mejoras del terreno apareceran aqui." />
            ) : (
              <ul className="space-y-2.5">
                {work.projects.map((project) => {
                  const tasks = work.tasks.filter((task) => task.projectId === project.id);
                  const open = tasks.filter((task) => task.status !== "terminada").length;
                  return (
                    <li key={project.id}>
                      <Link
                        href={`/proyectos/${project.id}`}
                        className="card block px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-ink">{project.name}</p>
                          <Badge tone={open > 0 ? "warn" : "brand"}>
                            {tasks.length === 0 ? "Sin tareas" : open > 0 ? `${open} abiertas` : "Terminadas"}
                          </Badge>
                        </div>
                        {project.zone ? <p className="mt-1 text-sm text-muted">{project.zone}</p> : null}
                        {project.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-muted">{project.description}</p>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <h2 className="section-title">Tareas periodicas</h2>
            </div>
            {admin ? (
              <div className="mb-3">
                <Link href="/proyectos/periodicas/nueva" className="text-sm font-semibold text-brand hover:underline">
                  Nueva tarea periodica
                </Link>
              </div>
            ) : null}
            {work.recurring.length === 0 ? (
              <EmptyState title="Aun no hay tareas periodicas" description="Regar, filtros y otros avisos saldran aqui." />
            ) : (
              <ul className="space-y-2.5">
                {work.recurring.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/proyectos/periodicas/${task.id}`}
                      className="card block px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
                    >
                      <p className="font-semibold text-ink">{task.title}</p>
                      <p className="mt-1 text-sm text-muted">{describeRecurrence(task)}</p>
                      <p className="mt-1 text-xs text-muted">
                        {formatRange(task.startDate, task.endDate)}
                        {task.zone ? ` · ${task.zone}` : ""}
                        {task.allowDone ? " · Se puede marcar hecha" : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
