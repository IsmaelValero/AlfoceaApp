import { notFound } from "next/navigation";

import { ProjectTaskForm } from "@/components/ProjectTaskForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { createProjectTask } from "@/app/proyectos/actions";

export const dynamic = "force-dynamic";

export default async function NewProjectTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [project, members] = await Promise.all([db.projects.get(id), db.members.list()]);
  if (!project) notFound();

  const action = createProjectTask.bind(null, id);

  return (
    <main className="screen">
      <PageHeader eyebrow={project.name} title="Nueva tarea" />
      <ProjectTaskForm action={action} members={members} submitLabel="Crear tarea" cancelHref={`/proyectos/${id}`} />
    </main>
  );
}
