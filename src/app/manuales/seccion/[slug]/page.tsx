import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState, ModuleTitle } from "@/components/ui";
import { listManuals } from "@/lib/queries";
import { manualCategoryFromSlug } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ManualSectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = manualCategoryFromSlug(slug);
  if (!category) notFound();

  const manuals = (await listManuals()).filter((manual) => manual.category === category);

  return (
    <main className="screen">
      <ModuleTitle title={category} />

      {manuals.length === 0 ? (
        <EmptyState title="Aun no hay manuales" description="Cuando se anadan a esta seccion, saldran aqui." />
      ) : (
        <ul className="space-y-2.5">
          {manuals.map((manual) => (
            <li key={manual.id}>
              <Link
                href={`/manuales/${manual.id}`}
                className="card block px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
              >
                <p className="font-semibold text-ink">{manual.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">{manual.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
