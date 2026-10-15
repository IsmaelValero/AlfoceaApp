import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmSubmit } from "@/components/ConfirmSubmit";
import { MarkDoneButton } from "@/components/MarkDoneButton";
import { Badge, BUTTON_STYLES, PageHeader } from "@/components/ui";
import { addDays, formatLong, todayKey } from "@/lib/dates";
import { describeRecurrence, occurrencesBetween } from "@/lib/recurrence";
import { getAdminSession } from "@/lib/authz";
import { loadWorkData } from "@/lib/queries";

import { deleteRecurringTask } from "../../actions";

export const dynamic = "force-dynamic";

export default async function RecurringTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [work, admin] = await Promise.all([loadWorkData(), getAdminSession()]);
  const task = work.recurring.find((item) => item.id === id);
  if (!task) notFound();

  const manual = task.manualId ? work.manuals.find((item) => item.id === task.manualId) : undefined;
  const today = todayKey();
  const upcoming = occurrencesBetween(task, today, addDays(today, 60)).slice(0, 8);

  return (
    <main className="screen">
      <PageHeader title={task.title} subtitle={describeRecurrence(task)} />
      <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Badge tone="neutral">Sin fecha límite</Badge>
        {task.zone ? <span>{task.zone}</span> : null}
      </p>

      {manual ? (
        <Link href={`/manuales/${manual.id}`} className={`${BUTTON_STYLES.secondary} mb-5 w-full`}>
          Ver instrucciones
        </Link>
      ) : null}

      <section>
        <h2 className="section-title mb-2">Proximas fechas</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted">No quedan fechas dentro del periodo.</p>
        ) : (
          <ul className="space-y-2.5">
            {upcoming.map((date) => {
              const completion = work.completions.find((item) => item.taskId === task.id && item.date === date);
              const member = completion?.memberId
                ? work.members.find((item) => item.id === completion.memberId)
                : undefined;
              return (
                <li key={date} className="card px-4 py-3">
                  <p className="font-semibold text-ink">{formatLong(date)}</p>
                  {completion ? (
                    <p className="mt-1 text-sm text-muted">Hecha{member ? ` por ${member.name}` : ""}</p>
                  ) : null}
                  {task.allowDone ? (
                    <div className="mt-3">
                      <MarkDoneButton taskId={task.id} date={date} done={Boolean(completion)} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {admin ? (
        <div className="mt-6 space-y-3">
          <Link href={`/proyectos/periodicas/${task.id}/editar`} className={`${BUTTON_STYLES.secondary} w-full`}>
            Editar
          </Link>
          <form action={deleteRecurringTask}>
            <input type="hidden" name="id" value={task.id} />
            <ConfirmSubmit message="¿Eliminar esta tarea periodica?">Eliminar</ConfirmSubmit>
          </form>
        </div>
      ) : null}
    </main>
  );
}
