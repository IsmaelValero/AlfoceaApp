import { notFound } from "next/navigation";

import { RecurringTaskForm } from "@/components/RecurringTaskForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { updateRecurringTask } from "@/app/proyectos/actions";

export const dynamic = "force-dynamic";

export default async function EditRecurringTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [task, manuals] = await Promise.all([db.recurringTasks.get(id), db.manuals.list()]);
  if (!task) notFound();

  const action = updateRecurringTask.bind(null, id);

  return (
    <main className="screen">
      <PageHeader title="Editar tarea periodica" />
      <RecurringTaskForm
        action={action}
        task={task}
        manuals={manuals}
        submitLabel="Guardar"
        cancelHref={`/proyectos/periodicas/${id}`}
      />
    </main>
  );
}
