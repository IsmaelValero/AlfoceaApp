import { redirect } from "next/navigation";

/** La alta de reservas queda para la vista de administrador. */
export default function NewReservationPage() {
  redirect("/reservas");
}
