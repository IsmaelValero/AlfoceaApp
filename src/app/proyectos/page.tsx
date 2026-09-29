import { ComingSoon } from "@/components/ComingSoon";
import { TasksIcon } from "@/components/icons";

export default function ProjectsPage() {
  return (
    <ComingSoon
      title="Proyectos"
      description="Aqui llevaremos las obras, mejoras y tareas pendientes del terreno."
      icon={<TasksIcon className="h-7 w-7" />}
      ideas={[
        "Proyectos con presupuesto, responsable y fecha objetivo",
        "Tareas sueltas que cualquiera puede coger cuando vaya",
        "Reparto de trabajo entre las familias",
        "Historial de lo que ya se hizo y cuanto costo",
      ]}
    />
  );
}
