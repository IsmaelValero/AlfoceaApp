"use client";

import { toggleRecurringDone } from "@/app/proyectos/actions";
import { BUTTON_STYLES } from "@/components/ui";

export function MarkDoneButton({
  taskId,
  date,
  done,
}: {
  taskId: string;
  date: string;
  done: boolean;
}) {
  return (
    <form action={toggleRecurringDone}>
      <input type="hidden" name="taskId" value={taskId} />
      <input type="hidden" name="date" value={date} />
      <button type="submit" className={`${done ? BUTTON_STYLES.secondary : BUTTON_STYLES.primary} w-full`}>
        {done ? "Desmarcar" : "Marcar como hecha"}
      </button>
    </form>
  );
}
