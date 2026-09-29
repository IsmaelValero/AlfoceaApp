import { addDays, startOfWeek, todayKey } from "@/lib/dates";
import type { Family, Manual, Member, Reservation, Rule } from "@/lib/types";

/**
 * Datos de ejemplo con los que arranca la app la primera vez.
 * Se escriben en /data solo si el fichero de la coleccion aun no existe,
 * asi que puedes editarlos o borrarlos sin miedo desde la propia app.
 */

const FAMILY = {
  zaragoza: "fam-zaragoza",
  huesca: "fam-huesca",
  barcelona: "fam-barcelona",
} as const;

export function seedFamilies(): Family[] {
  return [
    { id: FAMILY.zaragoza, name: "Los de Zaragoza", color: "#2F6B4F", notes: "Rama que vive mas cerca del terreno." },
    { id: FAMILY.huesca, name: "Los de Huesca", color: "#C2703D" },
    { id: FAMILY.barcelona, name: "Los de Barcelona", color: "#3B6EA5", notes: "Suelen venir en puentes y vacaciones." },
  ];
}

export function seedMembers(): Member[] {
  return [
    { id: "mem-1", familyId: FAMILY.zaragoza, name: "Ismael", role: "admin", phone: "600 000 001" },
    { id: "mem-2", familyId: FAMILY.zaragoza, name: "Marta", role: "adulto" },
    { id: "mem-3", familyId: FAMILY.zaragoza, name: "Lucia", role: "joven" },
    { id: "mem-4", familyId: FAMILY.huesca, name: "Javier", role: "admin", phone: "600 000 002" },
    { id: "mem-5", familyId: FAMILY.huesca, name: "Pilar", role: "adulto" },
    { id: "mem-6", familyId: FAMILY.barcelona, name: "Ana", role: "adulto", email: "ana@example.com" },
    { id: "mem-7", familyId: FAMILY.barcelona, name: "Diego", role: "joven" },
  ];
}

export function seedReservations(): Reservation[] {
  const monday = startOfWeek(todayKey());
  const createdAt = new Date().toISOString();

  return [
    {
      id: "res-1",
      title: "Fin de semana en la casa",
      familyId: FAMILY.zaragoza,
      memberId: "mem-1",
      zone: "Zona 1",
      startDate: addDays(monday, 4),
      endDate: addDays(monday, 6),
      startTime: "16:00",
      endTime: "22:00",
      guests: 5,
      status: "confirmada",
      notes: "Llegamos el viernes por la tarde. Traemos nosotros la comida del sabado.",
      createdAt,
    },
    {
      id: "res-2",
      title: "Bano y merienda",
      familyId: FAMILY.huesca,
      memberId: "mem-4",
      zone: "Zona 2",
      startDate: addDays(monday, 2),
      endDate: addDays(monday, 2),
      startTime: "11:00",
      endTime: "14:00",
      guests: 4,
      status: "confirmada",
      createdAt,
    },
    {
      id: "res-3",
      title: "Comida familiar",
      familyId: FAMILY.barcelona,
      memberId: "mem-6",
      zone: "Zona 1",
      startDate: addDays(monday, 12),
      endDate: addDays(monday, 12),
      startTime: "13:00",
      endTime: "17:00",
      guests: 12,
      status: "pendiente",
      notes: "Pendiente de confirmar cuantos vienen de Barcelona.",
      createdAt,
    },
    {
      id: "res-4",
      title: "Semana de vacaciones",
      familyId: FAMILY.barcelona,
      memberId: "mem-6",
      zone: "Zona 1",
      startDate: addDays(monday, 21),
      endDate: addDays(monday, 27),
      startTime: "10:00",
      endTime: "20:00",
      guests: 8,
      status: "pendiente",
      createdAt,
    },
    {
      id: "res-5",
      title: "Poda y limpieza del seto",
      familyId: FAMILY.zaragoza,
      memberId: "mem-2",
      zone: "Zona 2",
      startDate: addDays(monday, -5),
      endDate: addDays(monday, -5),
      startTime: "09:00",
      endTime: "13:00",
      guests: 2,
      status: "confirmada",
      createdAt,
    },
  ];
}

export function seedManuals(): Manual[] {
  const updatedAt = new Date().toISOString();

  return [
    {
      id: "man-1",
      title: "Abrir y cerrar el riego por goteo",
      category: "Agua y riego",
      summary: "Secuencia de llaves para regar el huerto y el frutal sin dejar el sistema en carga.",
      content: [
        "El riego funciona por sectores y comparte la bomba con la piscina, asi que nunca deben estar los dos abiertos a la vez.",
        "",
        "- Comprueba que la llave general del pozo (caseta, pared izquierda) esta abierta.",
        "- Abre el sector que vayas a regar: la llave 1 es el huerto y la llave 2 el frutal.",
        "- Enciende la bomba desde el cuadro de la caseta, interruptor verde.",
        "- Espera unos dos minutos y revisa que no haya goteros reventados.",
        "- Al terminar, apaga primero la bomba y cierra despues las llaves de sector.",
        "",
        "Si el manometro pasa de 3 bar, apaga la bomba: casi siempre significa que hay un sector cerrado por error.",
      ].join("\n"),
      updatedAt,
    },
    {
      id: "man-2",
      title: "Puesta en marcha de la depuradora",
      category: "Piscina",
      summary: "Arranque de temporada, ciclo de filtrado diario y lavado del filtro de arena.",
      content: [
        "La depuradora se deja en marcha de mayo a septiembre.",
        "",
        "- Pon la valvula selectora en FILTRACION antes de dar corriente.",
        "- Nunca gires la valvula con la bomba encendida: se rompe la junta interior.",
        "- Programa el reloj para 8 horas diarias en verano y 4 en primavera.",
        "- Haz un LAVADO de 2 minutos cuando el manometro suba 0,5 bar sobre lo normal.",
        "- Despues de cada lavado, ENJUAGUE de 30 segundos y vuelta a FILTRACION.",
        "",
        "El cloro se mide dos veces por semana. Valor objetivo entre 1 y 1,5 ppm.",
      ].join("\n"),
      updatedAt,
    },
    {
      id: "man-3",
      title: "Cuadro electrico y diferencial",
      category: "Electricidad",
      summary: "Que hacer cuando salta la luz y como identificar el circuito afectado.",
      content: [
        "El cuadro esta en la entrada de la casa, detras de la puerta.",
        "",
        "- Baja todos los automaticos antes de volver a subir el diferencial.",
        "- Sube el diferencial (el grande de la izquierda).",
        "- Ve subiendo los automaticos de uno en uno, esperando unos segundos.",
        "- El que haga saltar el diferencial otra vez es el circuito con problema: dejalo bajado y avisa al grupo.",
        "",
        "La bomba del pozo y el horno no deben funcionar a la vez con el contrato actual.",
      ].join("\n"),
      updatedAt,
    },
    {
      id: "man-4",
      title: "Cerrar la casa al marcharse",
      category: "Casa",
      summary: "Checklist de la ultima persona que sale del terreno.",
      content: [
        "- Vacia las neveras de comida fresca y deja la puerta entornada si no queda nadie mas esa semana.",
        "- Cierra la llave general del agua de la casa.",
        "- Baja los automaticos salvo el del congelador.",
        "- Cierra contraventanas y echa el cerrojo de la puerta trasera.",
        "- Saca la basura al contenedor del camino.",
        "- Deja anotado en el grupo cualquier averia que hayas visto.",
      ].join("\n"),
      updatedAt,
    },
    {
      id: "man-5",
      title: "Desbrozadora y cortacesped",
      category: "Maquinaria",
      summary: "Combustible, arranque y mantenimiento basico de las dos maquinas.",
      content: [
        "La desbrozadora usa mezcla al 2% (gasolina + aceite de dos tiempos). El cortacesped usa gasolina sola.",
        "",
        "- No intercambies los bidones: estan etiquetados en rojo (mezcla) y verde (gasolina).",
        "- Antes de arrancar, revisa el nivel de aceite del cortacesped.",
        "- Arranque en frio: cebador cerrado, tres tirones, abrir cebador.",
        "- Limpia la cuchilla y la carcasa al terminar, con la bujia desconectada.",
        "",
        "Guarda siempre las maquinas en la caseta, nunca a la intemperie.",
      ].join("\n"),
      updatedAt,
    },
  ];
}

export function seedRules(): Rule[] {
  const updatedAt = new Date().toISOString();

  return [
    {
      id: "rule-1",
      title: "Reservar con al menos 3 dias de antelacion",
      category: "Reservas",
      content:
        "Las estancias se reservan en la app con un minimo de 3 dias de antelacion, salvo visitas de un rato sin pernoctar. Asi todos podemos organizarnos y evitamos coincidencias no deseadas.",
      priority: "alta",
      pinned: true,
      updatedAt,
    },
    {
      id: "rule-2",
      title: "Quien usa la piscina, la deja limpia",
      category: "Piscina",
      content:
        "Recoger flotadores y toallas, pasar el recogehojas y comprobar que el skimmer no esta atascado. Si has sido el ultimo del dia, cubre la piscina con la lona.",
      priority: "alta",
      pinned: true,
      updatedAt,
    },
    {
      id: "rule-3",
      title: "Se sale como se entra",
      category: "Limpieza",
      content:
        "Cada familia deja la casa recogida y barrida, la nevera sin comida abierta y las sabanas usadas en el cesto. La basura se baja al contenedor del camino.",
      priority: "alta",
      pinned: true,
      updatedAt,
    },
    {
      id: "rule-4",
      title: "Silencio a partir de las 23:30",
      category: "Convivencia",
      content:
        "Musica y actividades ruidosas terminan a las 23:30 por respeto a las parcelas vecinas. En verano, las barbacoas con mucha gente se avisan antes en el grupo.",
      priority: "media",
      pinned: false,
      updatedAt,
    },
    {
      id: "rule-5",
      title: "Los gastos comunes se reparten por familia",
      category: "Gastos",
      content:
        "Luz, agua, seguro y mantenimiento se dividen a partes iguales entre las tres ramas familiares. Las compras puntuales las adelanta quien esta alli y se anotan para el reparto trimestral.",
      priority: "media",
      pinned: false,
      updatedAt,
    },
    {
      id: "rule-6",
      title: "Invitados de fuera de la familia",
      category: "Convivencia",
      content:
        "Se pueden traer invitados avisando en la reserva e indicando cuantos son. La familia anfitriona es responsable de ellos y de que conozcan las normas basicas.",
      priority: "media",
      pinned: false,
      updatedAt,
    },
    {
      id: "rule-7",
      title: "Nunca dejar la bomba del pozo encendida sin vigilancia",
      category: "Seguridad",
      content:
        "La bomba no debe quedar funcionando si no hay nadie en el terreno. Antes de marcharte, comprueba el cuadro de la caseta y que el manometro esta a cero.",
      priority: "alta",
      pinned: false,
      updatedAt,
    },
  ];
}
