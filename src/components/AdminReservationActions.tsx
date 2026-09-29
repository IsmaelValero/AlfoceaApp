import { setReservationStatus } from "@/app/reservas/actions";
import { BUTTON_STYLES } from "@/components/ui";

/** Botones de administrador para aceptar o rechazar una reserva pendiente. */
export function AdminReservationActions({ id }: { id: string }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <form action={setReservationStatus}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="confirmada" />
        <button type="submit" className={`${BUTTON_STYLES.primary} w-full`}>
          Aceptar
        </button>
      </form>
      <form action={setReservationStatus}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="cancelada" />
        <button type="submit" className={`${BUTTON_STYLES.danger} w-full`}>
          Rechazar
        </button>
      </form>
    </div>
  );
}
