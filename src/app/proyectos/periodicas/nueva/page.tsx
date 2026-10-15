import { RecurringTaskForm } from "@/components/RecurringTaskForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { createRecurringTask } from "@/app/proyectos/actions";

export const dynamic = "force-dynamic";

export default async function NewRecurringTaskPage() {
  await requireAdmin();
  const manuals = await db.manuals.list();

  return (
    <main className="screen">
      <PageHeader title="Nueva tarea periodica" />
      <RecurringTaskForm action={createRecurringTask} manuals={manuals} submitLabel="Crear tarea" cancelHref="/proyectos" />
    </main>
  );
}
