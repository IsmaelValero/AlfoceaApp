import Link from "next/link";

import { BackLink, EmptyState, PageHeader } from "@/components/ui";
import { listManuals } from "@/lib/queries";
import type { Manual } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ManualsPage() {
  const manuals = await listManuals();

  // Agrupados por categoria, manteniendo el orden alfabetico de listManuals.
  const groups = manuals.reduce<Map<string, Manual[]>>((map, manual) => {
    const bucket = map.get(manual.category) ?? [];
    bucket.push(manual);
    map.set(manual.category, bucket);
    return map;
  }, new Map());

  return (
    <main className="screen">
      <BackLink href="/modulos" label="Modulos" />

      <PageHeader
        eyebrow="Manuales"
        title="Como funciona todo"
        subtitle="Instrucciones del terreno, por si te toca a ti."
      />

      {manuals.length === 0 ? (
        <EmptyState title="Aun no hay manuales" description="Cuando se anadan, podras consultarlos aqui." />
      ) : (
        <div className="space-y-6">
          {[...groups].map(([category, items]) => (
            <section key={category}>
              <h2 className="section-title mb-2">{category}</h2>
              <ul className="space-y-2.5">
                {items.map((manual) => (
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
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
