import type { ManualAttachment } from "@/lib/types";

export function ManualAttachments({ attachments }: { attachments: ManualAttachment[] }) {
  if (!attachments.length) return null;

  const images = attachments.filter((item) => item.kind === "image");
  const pdfs = attachments.filter((item) => item.kind === "pdf");

  return (
    <section className="mt-5 space-y-4">
      {images.length > 0 ? (
        <div>
          <h2 className="section-title mb-2">Fotos</h2>
          <ul className="grid grid-cols-2 gap-2">
            {images.map((item) => (
              <li key={item.id}>
                <a href={item.url} target="_blank" rel="noreferrer" className="card block overflow-hidden p-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.name} className="aspect-[4/3] w-full object-cover" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pdfs.length > 0 ? (
        <div>
          <h2 className="section-title mb-2">Documentos</h2>
          <ul className="space-y-2">
            {pdfs.map((item) => (
              <li key={item.id}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="card flex items-center justify-between gap-3 px-4 py-3 transition hover:border-brand/40"
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">{item.name}</span>
                  <span className="shrink-0 text-xs font-semibold text-brand">Abrir PDF</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
