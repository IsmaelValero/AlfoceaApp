import { notFound } from "next/navigation";

import { ProjectTaskForm } from "@/components/ProjectTaskForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { updateProjectTask } from "@/app/proyectos/actions";

export const dynamic = "force-dynamic";

export default async function EditProjectTaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  await requireAdmin();
  const { id, taskId } = await params;
  const [task, members] = await Promise.all([db.projectTasks.get(taskId), db.members.list()]);
  if (!task || task.projectId !== id) notFound();

  const action = updateProjectTask.bind(null, id, taskId);

  return (
    <main className="screen">
      <PageHeader title="Editar tarea" />
      <ProjectTaskForm
        action={action}
        task={task}
        members={members}
        submitLabel="Guardar"
        cancelHref={`/proyectos/${id}`}
      />
    </main>
  );
}
