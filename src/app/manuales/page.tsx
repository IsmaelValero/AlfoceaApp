import Link from "next/link";

import { AdminCreateLink } from "@/components/AdminLinks";
import { ModuleTitle } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { listManuals } from "@/lib/queries";
import { MANUAL_CATEGORIES, manualSectionHref } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ManualsPage() {
  const [manuals, admin] = await Promise.all([listManuals(), getAdminSession()]);
  const counts = new Map<string, number>(MANUAL_CATEGORIES.map((category) => [category, 0]));
  for (const manual of manuals) {
    counts.set(manual.category, (counts.get(manual.category) ?? 0) + 1);
  }

  return (
    <main className="screen">
      <ModuleTitle title="Manuales" />
      {admin ? <AdminCreateLink href="/manuales/nuevo" label="Nuevo manual" /> : null}

      <ul className="space-y-2.5">
        {MANUAL_CATEGORIES.map((category) => {
          const count = counts.get(category) ?? 0;
          return (
            <li key={category}>
              <Link
                href={manualSectionHref(category)}
                className="card flex items-center justify-between gap-3 px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{category}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {count === 0 ? "Aun no hay manuales" : count === 1 ? "1 manual" : `${count} manuales`}
                  </p>
                </div>
                <span className="text-lg font-semibold text-brand" aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
