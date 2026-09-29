import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { ReservationCard } from "@/components/ReservationCard";
import { Badge, BUTTON_STYLES } from "@/components/ui";
import { getAdminSession } from "@/lib/authz";
import { todayKey } from "@/lib/dates";
import { getFamilyWithMembers, listReservations } from "@/lib/queries";
import { MEMBER_ROLES } from "@/lib/types";

import { deleteFamily, deleteMember } from "../actions";

export const dynamic = "force-dynamic";

export default async function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [family, reservations, admin] = await Promise.all([
    getFamilyWithMembers(id),
    listReservations(),
    getAdminSession(),
  ]);

  if (!family) notFound();

  const today = todayKey();
  const upcoming = reservations.filter((r) => r.familyId === id && r.endDate >= today);

  return (
    <main className="screen">
      <header className="mb-6 flex items-start gap-3">
        <span
          className="mt-1.5 h-4 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: family.color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{family.name}</h1>
          {family.notes ? <p className="mt-1 text-sm text-muted">{family.notes}</p> : null}
        </div>
      </header>

      {admin ? (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link href={`/familias/${id}/editar`} className={`${BUTTON_STYLES.secondary} w-full`}>
            Editar familia
          </Link>
          <Link href={`/familias/${id}/miembros/nuevo`} className={`${BUTTON_STYLES.primary} w-full`}>
            Anadir persona
          </Link>
        </div>
      ) : null}

      <div className="split-pane">
        <section>
          <h2 className="section-title mb-2">Miembros</h2>
          {family.members.length > 0 ? (
            <ul className="space-y-2">
              {family.members.map((member) => {
                const role = MEMBER_ROLES.find((r) => r.value === member.role);
                const contact = member.phone ?? member.email;
                return (
                  <li key={member.id} className="card px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{member.name}</p>
                        {contact ? (
                          <a
                            href={member.phone ? `tel:${member.phone.replace(/\s/g, "")}` : `mailto:${member.email}`}
                            className="mt-0.5 block truncate text-xs font-medium text-brand"
                          >
                            {contact}
                          </a>
                        ) : (
                          <p className="mt-0.5 text-xs text-muted">Sin contacto</p>
                        )}
                      </div>
                      <Badge tone={member.role === "admin" ? "brand" : "neutral"}>{role?.label ?? member.role}</Badge>
                    </div>
                    {admin ? (
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/familias/${id}/miembros/${member.id}`}
                          className={`${BUTTON_STYLES.secondary} flex-1 text-center text-sm`}
                        >
                          Editar
                        </Link>
                        <form action={deleteMember} className="flex-1">
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="familyId" value={id} />
                          <ConfirmSubmit message={`¿Eliminar a ${member.name}?`}>Quitar</ConfirmSubmit>
                        </form>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="card px-4 py-5 text-center text-sm text-muted">Esta familia aun no tiene miembros.</p>
          )}
        </section>

        <section>
          <h2 className="section-title mb-2">Proximas reservas</h2>
          {upcoming.length > 0 ? (
            <ul className="space-y-2.5">
              {upcoming.map((reservation) => (
                <li key={reservation.id}>
                  <ReservationCard reservation={reservation} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="card px-4 py-5 text-center text-sm text-muted">Esta familia no tiene reservas por delante.</p>
          )}
        </section>
      </div>

      {admin ? (
        <form action={deleteFamily} className="mt-8">
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmit message="¿Eliminar esta familia y todos sus miembros?">Eliminar familia</ConfirmSubmit>
        </form>
      ) : null}
    </main>
  );
}
