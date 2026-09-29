import { ComingSoon } from "@/components/ComingSoon";
import { BoxIcon } from "@/components/icons";

export default function InventoryPage() {
  return (
    <ComingSoon
      title="Inventario"
      description="Aqui apuntaremos que hay en el terreno y donde esta guardado."
      icon={<BoxIcon className="h-7 w-7" />}
      ideas={[
        "Herramientas y maquinaria con su ubicacion",
        "Consumibles que hay que reponer (gasolina, cloro, bombillas)",
        "Quien se ha llevado prestado algo",
        "Fotos y facturas de cada cosa",
      ]}
    />
  );
}
