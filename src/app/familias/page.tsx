import Link from "next/link";

import { AdminCreateLink } from "@/components/AdminLinks";
import { EmptyState, ModuleTitle } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { listFamiliesWithMembers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FamiliesPage() {
  const [families, admin] = await Promise.all([listFamiliesWithMembers(), getAdminSession()]);

  return (
    <main className="screen">
      <ModuleTitle title="Familias" />
      {admin ? <AdminCreateLink href="/familias/nueva" label="Nueva familia" /> : null}

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
