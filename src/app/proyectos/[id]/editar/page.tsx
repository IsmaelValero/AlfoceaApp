import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/ProjectForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { db } from "@/lib/db";
import { updateProject } from "@/app/proyectos/actions";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const project = await db.projects.get(id);
  if (!project) notFound();

  const action = updateProject.bind(null, id);

  return (
    <main className="screen">
      <PageHeader title="Editar proyecto" />
      <ProjectForm action={action} project={project} submitLabel="Guardar" cancelHref={`/proyectos/${id}`} />
    </main>
  );
}
