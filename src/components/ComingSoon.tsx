import { ModuleTitle } from "@/components/ui";

/** Pantalla de los modulos que aun no se han desarrollado. */
export function ComingSoon({
  title,
  description,
  icon,
  ideas,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  ideas: string[];
}) {
  return (
    <main className="screen">
      <ModuleTitle title={title} />

      <div className="card px-6 py-8 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft">{icon}</span>
        <p className="text-sm text-muted">{description}</p>
      </div>

      <section className="mt-6">
        <h2 className="section-title mb-2">Lo que hara cuando este listo</h2>
        <ul className="card divide-y divide-line">
          {ideas.map((idea) => (
            <li key={idea} className="flex gap-3 px-4 py-3 text-sm text-ink/85">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              {idea}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
