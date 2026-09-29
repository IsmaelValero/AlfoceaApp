import Link from "next/link";

import { BackLink, EmptyState, PageHeader } from "@/components/ui";
import { listFamiliesWithMembers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FamiliesPage() {
  const families = await listFamiliesWithMembers();
  const people = families.reduce((sum, family) => sum + family.members.length, 0);

  return (
    <main className="screen">
      <BackLink href="/modulos" label="Modulos" />

      <PageHeader
        eyebrow="Familias"
        title="Quien somos"
        subtitle={`${families.length} ramas familiares y ${people} personas.`}
      />

      {families.length === 0 ? (
        <EmptyState title="Aun no hay familias" description="Cuando se den de alta, las veras aqui." />
      ) : (
        <ul className="space-y-2.5">
          {families.map((family) => (
            <li key={family.id}>
              <Link
                href={`/familias/${family.id}`}
                className="card block overflow-hidden border-l-4 px-4 py-3.5 transition hover:shadow-md"
                style={{ borderLeftColor: family.color }}
              >
                <p className="font-semibold text-ink">{family.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {family.members.length === 0
                    ? "Sin miembros todavia"
                    : family.members.map((member) => member.name).join(", ")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
