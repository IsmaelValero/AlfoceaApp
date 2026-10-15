import { ProjectForm } from "@/components/ProjectForm";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/authz";
import { createProject } from "@/app/proyectos/actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <main className="screen">
      <PageHeader title="Nuevo proyecto" />
      <ProjectForm action={createProject} submitLabel="Crear proyecto" cancelHref="/proyectos" />
    </main>
  );
}
