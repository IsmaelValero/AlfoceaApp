import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { ManualAttachments } from "@/components/ManualAttachments";
import { Badge, BUTTON_STYLES, PageHeader, RichText } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { getManual } from "@/lib/queries";
import { manualSectionHref } from "@/lib/types";

import { deleteManual } from "../actions";

export const dynamic = "force-dynamic";

export default async function ManualDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [manual, admin] = await Promise.all([getManual(id), getAdminSession()]);

  if (!manual) notFound();

  return (
    <main className="screen fill-phone flex flex-col">
      <div className="mb-2">
        <Badge tone="brand">{manual.category}</Badge>
      </div>

      <PageHeader title={manual.title} subtitle={manual.summary} />

      <article className="card p-5">
        <RichText content={manual.content} listStyle="steps" />
      </article>

      <ManualAttachments attachments={manual.attachments ?? []} />

      <div className="mt-auto space-y-3 pt-6">
        {admin ? (
          <>
            <Link href={`/manuales/${manual.id}/editar`} className={`${BUTTON_STYLES.secondary} w-full`}>
              Editar manual
            </Link>
            <form action={deleteManual}>
              <input type="hidden" name="id" value={manual.id} />
              <ConfirmSubmit message="¿Eliminar este manual?">Eliminar</ConfirmSubmit>
            </form>
          </>
        ) : null}
        <Link href={manualSectionHref(manual.category)} replace className={`${BUTTON_STYLES.secondary} w-full`}>
          Salir
        </Link>
      </div>
    </main>
  );
}
