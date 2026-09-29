import { ModuleTile } from "@/components/ModuleTile";
import { BookIcon, BoxIcon, CalendarIcon, ShieldIcon, TasksIcon, UsersIcon } from "@/components/icons";
import { todayKey } from "@/lib/dates";
import { listFamiliesWithMembers, listManuals, listReservations, listRules } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ModulesPage() {
  const [reservations, manuals, rules, families] = await Promise.all([
    listReservations(),
    listManuals(),
    listRules(),
    listFamiliesWithMembers(),
  ]);

  const today = todayKey();
  const upcoming = reservations.filter((r) => r.status !== "cancelada" && r.endDate >= today).length;
  const people = families.reduce((sum, family) => sum + family.members.length, 0);

  return (
    <main className="screen">
      <header className="mb-6">
        <p className="section-title">Alfocea</p>
        <h1 className="mt-1 text-[1.75rem] font-bold leading-tight tracking-tight text-ink">Modulos</h1>
        <p className="mt-1 text-sm text-muted">Consulta reservas, normas y quien viene.</p>
      </header>

      <div className="modules-grid grid grid-cols-2 gap-3">
        <ModuleTile
          href="/reservas"
          title="Reservas"
          description="Calendario y fichas de cada estancia"
          icon={<CalendarIcon />}
          meta={upcoming > 0 ? `${upcoming} por venir` : "Sin reservas proximas"}
        />
        <ModuleTile
          href="/manuales"
          title="Manuales"
          description="Como funciona cada cosa del terreno"
          icon={<BookIcon />}
          tone="sand"
          meta={`${manuals.length} manuales`}
        />
        <ModuleTile
          href="/normas"
          title="Normas de uso"
          description="Acuerdos de convivencia de la familia"
          icon={<ShieldIcon />}
          meta={`${rules.length} normas`}
        />
        <ModuleTile
          href="/familias"
          title="Familias"
          description="Ramas, miembros y roles"
          icon={<UsersIcon />}
          tone="sand"
          meta={`${families.length} familias - ${people} personas`}
        />
        <ModuleTile
          href="/proyectos"
          title="Proyectos y tareas"
          description="Obras y mejoras pendientes"
          icon={<TasksIcon />}
          soon
        />
        <ModuleTile
          href="/inventario"
          title="Inventario"
          description="Herramientas, muebles y material"
          icon={<BoxIcon />}
          tone="sand"
          soon
        />
      </div>
    </main>
  );
}
