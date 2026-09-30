import { redirect } from "next/navigation";

import Link from "next/link";

import { SyncMark } from "@/components/SyncMark";
import { Badge, BUTTON_STYLES, ModuleTitle } from "@/components/ui";
import { hasAdminRole } from "@/lib/authz";
import { getCurrentMember } from "@/lib/queries";
import { isViewingAsUser } from "@/lib/session";
import { logout, toggleAdminViewMode } from "@/app/perfil/actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const current = await getCurrentMember();
  if (!current) redirect("/login");

  const initial = current.member.name.slice(0, 1).toUpperCase();
  const fullName = [current.member.name, current.member.lastName].filter(Boolean).join(" ");
  const canSwitch = hasAdminRole(current.member);
  const viewingAsUser = canSwitch ? await isViewingAsUser() : false;

  return (
    <main className="screen fill-phone flex flex-col">
      <SyncMark mark={initial} />
      <ModuleTitle title={fullName} />

      <section className="card mb-5 space-y-2 px-4 py-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted">Familia</dt>
          <dd className="text-right text-sm font-semibold text-ink">{current.family.name}</dd>
        </div>
        {canSwitch ? (
          <form action={toggleAdminViewMode} className="border-t border-line pt-2">
            <button
              type="submit"
              className="flex w-full items-center justify-between gap-4 text-left transition active:scale-[0.99]"
              aria-label={
                viewingAsUser
                  ? "Cambiar a modo administrador"
                  : "Cambiar a modo usuario"
              }
            >
              <span className="text-sm text-muted">Perfil</span>
              <span className="inline-flex items-center gap-1.5">
                <Badge tone={viewingAsUser ? "neutral" : "brand"}>
                  {viewingAsUser ? "Usuario" : "Administrador"}
                </Badge>
                <span className="text-sm font-semibold text-brand" aria-hidden="true">
                  ⇄
                </span>
              </span>
            </button>
          </form>
        ) : null}
      </section>

      <ul className="space-y-2.5">
        <li>
          <Link
            href="/perfil/estilos"
            className="card flex items-center justify-between gap-3 px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
          >
            <p className="font-semibold text-ink">Estilos</p>
            <span className="text-lg font-semibold text-brand" aria-hidden="true">
              ›
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/perfil/cuenta"
            className="card flex items-center justify-between gap-3 px-4 py-3.5 transition hover:border-brand/40 hover:shadow-md"
          >
            <p className="font-semibold text-ink">Cuenta</p>
            <span className="text-lg font-semibold text-brand" aria-hidden="true">
              ›
            </span>
          </Link>
        </li>
      </ul>

      <form action={logout} className="mt-auto pt-6">
        <button type="submit" className={`${BUTTON_STYLES.danger} w-full`}>
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
