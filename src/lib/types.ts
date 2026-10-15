/**
 * Modelo de dominio de la app.
 *
 * Las fechas de calendario son cadenas "YYYY-MM-DD" (sin hora ni zona horaria)
 * para evitar desplazamientos de dia al serializar.
 */

export interface Entity {
  id: string;
}

/* ---------------------------------- Familias --------------------------------- */

export type MemberRole = "admin" | "adulto" | "joven" | "invitado";

export const MEMBER_ROLES: { value: MemberRole; label: string; description: string }[] = [
  { value: "admin", label: "Administrador", description: "Gestiona la app, aprueba reservas y edita normas" },
  { value: "adulto", label: "Adulto", description: "Puede reservar, votar y actualizar tareas asignadas" },
  { value: "joven", label: "Joven", description: "Puede reservar, votar y participar (cuenta propia, 18+)" },
  { value: "invitado", label: "Invitado", description: "Solo consulta" },
];

/** Colores sugeridos para identificar cada rama familiar en el calendario. */
export const FAMILY_COLORS = [
  "#2F6B4F",
  "#C2703D",
  "#3B6EA5",
  "#8A5AA8",
  "#B23B3B",
  "#B4801F",
  "#3F8F8A",
  "#6B7A72",
] as const;

export interface Family extends Entity {
  /** Nombre de la rama familiar, p. ej. "Los de Zaragoza" */
  name: string;
  /** Color de identificacion en el calendario (hex) */
  color: string;
  notes?: string;
}

export interface Member extends Entity {
  familyId: string;
  /** Nombre de pila. */
  name: string;
  /** Apellidos. */
  lastName?: string;
  role: MemberRole;
  phone?: string;
  email?: string;
  /** Día del cumpleaños (1-31). Vacío si aún no se conoce. */
  birthDay?: number | null;
  /** Mes del cumpleaños (1-12). */
  birthMonth?: number | null;
  /** Año, opcional. Sirve para la edad; el mes sale igual sin él. */
  birthYear?: number | null;
}

/* ---------------------------------- Reservas --------------------------------- */

export type ReservationStatus = "confirmada" | "pendiente" | "cancelada";

export const RESERVATION_STATUSES: { value: ReservationStatus; label: string }[] = [
  { value: "confirmada", label: "Confirmada" },
  { value: "pendiente", label: "Pendiente" },
  { value: "cancelada", label: "Cancelada" },
];

/** Zonas reservables del terreno. De momento solo dos. */
export const RESERVATION_ZONES = ["Zona 1", "Zona 2"] as const;

export type ReservationZone = (typeof RESERVATION_ZONES)[number];

export interface Reservation extends Entity {
  title: string;
  familyId: string;
  /** Miembro que hace la reserva (opcional) */
  memberId?: string;
  zone: ReservationZone;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD", inclusiva */
  endDate: string;
  /** "HH:MM". Si falta, la reserva ocupa el dia entero. */
  startTime?: string;
  /** "HH:MM" */
  endTime?: string;
  guests: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  /** Cuando el admin acepto o rechazo (para avisar al solicitante). */
  resolvedAt?: string;
}

/* ----------------------------- Manuales y normas ----------------------------- */

export const MANUAL_CATEGORIES = [
  "Piscina",
  "Huerto",
  "Casa",
  "Agua y riego",
  "Herramientas",
  "Maquinaria",
] as const;

export type ManualCategory = (typeof MANUAL_CATEGORIES)[number];

/** Slug de la URL /manuales/seccion/[slug]. */
export const MANUAL_SECTION_SLUGS: Record<ManualCategory, string> = {
  Piscina: "piscina",
  Huerto: "huerto",
  Casa: "casa",
  "Agua y riego": "agua-y-riego",
  Herramientas: "herramientas",
  Maquinaria: "maquinaria",
};

export function manualCategoryFromSlug(slug: string): ManualCategory | null {
  const entry = Object.entries(MANUAL_SECTION_SLUGS).find(([, value]) => value === slug);
  return (entry?.[0] as ManualCategory | undefined) ?? null;
}

export function manualSectionHref(category: ManualCategory) {
  return `/manuales/seccion/${MANUAL_SECTION_SLUGS[category]}`;
}

export type ManualAttachmentKind = "image" | "pdf";

export interface ManualAttachment {
  id: string;
  name: string;
  kind: ManualAttachmentKind;
  /** Ruta en Storage (o relativa en disco local). */
  path: string;
  /** URL publica para ver o descargar el fichero. */
  url: string;
}

export interface Manual extends Entity {
  title: string;
  category: ManualCategory;
  /** Resumen de una linea para el listado */
  summary: string;
  /** Cuerpo del manual. Una linea que empiece por "- " se pinta como paso. */
  content: string;
  /** Fotos y PDFs asociados al manual. */
  attachments: ManualAttachment[];
  updatedAt: string;
}

export const RULE_CATEGORIES = [
  "Convivencia",
  "Reservas",
  "Piscina",
  "Limpieza",
  "Seguridad",
  "Gastos",
] as const;

export type RuleCategory = (typeof RULE_CATEGORIES)[number];

export type RulePriority = "alta" | "media" | "baja";

export interface Rule extends Entity {
  title: string;
  category: RuleCategory;
  content: string;
  priority: RulePriority;
  /** Se muestra destacada en la pantalla de Inicio */
  pinned: boolean;
  updatedAt: string;
}

/* --------------------------- Proyectos y tareas ---------------------------- */

export type ProjectTaskStatus = "sin_comenzar" | "en_curso" | "terminada";

export const PROJECT_TASK_STATUSES: { value: ProjectTaskStatus; label: string }[] = [
  { value: "sin_comenzar", label: "Sin comenzar" },
  { value: "en_curso", label: "En curso" },
  { value: "terminada", label: "Terminada" },
];

export interface Project extends Entity {
  name: string;
  description: string;
  /** Texto libre, distinto de las zonas de reserva. */
  zone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask extends Entity {
  projectId: string;
  title: string;
  description: string;
  zone: string;
  status: ProjectTaskStatus;
  /** Miembros asignados. Al menos uno. */
  assigneeIds: string[];
  createdAt: string;
}

export type RecurrenceKind = "weekly" | "every_other_day" | "every_n_days" | "monthly";

export interface RecurringTask extends Entity {
  title: string;
  zone: string;
  /** Manual con las instrucciones, si lo hay. */
  manualId?: string;
  kind: RecurrenceKind;
  /** Cada N semanas o cada N dias. En mensual no se usa. */
  interval: number;
  /** 0 = lunes ... 6 = domingo. Solo en semanal. */
  weekdays: number[];
  /** Dia del mes, 1-31. Solo en mensual. */
  monthDay?: number;
  /** Ancla interna (alta de la tarea). No se muestra: no hay periodo. */
  startDate: string;
  /** Sin valor: la tarea no tiene fecha limite. */
  endDate?: string | null;
  /** Si es true, cualquiera puede marcar cada ocurrencia como hecha. */
  allowDone: boolean;
  createdAt: string;
}

export interface RecurringCompletion extends Entity {
  taskId: string;
  /** Dia concreto "YYYY-MM-DD". */
  date: string;
  memberId?: string;
  completedAt: string;
}

/* ---------------------------------- Eventos --------------------------------- */

export type EventKind = "cumpleanos_mes" | "navidad" | "ano_nuevo" | "celebracion";

export const EVENT_KINDS: { value: Exclude<EventKind, "cumpleanos_mes">; label: string }[] = [
  { value: "navidad", label: "Navidad" },
  { value: "ano_nuevo", label: "Año nuevo" },
  { value: "celebracion", label: "Celebración" },
];

export type PollStatus = "abierta" | "cerrada";

export type RsvpStatus = "voy" | "no_voy" | "duda";

export const RSVP_STATUSES: { value: RsvpStatus; label: string }[] = [
  { value: "voy", label: "Venimos" },
  { value: "no_voy", label: "No vamos" },
  { value: "duda", label: "Aún no lo sabemos" },
];

export interface Poll extends Entity {
  /** "YYYY-MM" */
  month: string;
  status: PollStatus;
  eventId?: string | null;
  createdAt: string;
}

export interface PollOption extends Entity {
  pollId: string;
  label: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export interface PollVote extends Entity {
  pollId: string;
  optionId: string;
  familyId: string;
  memberId?: string;
  peopleCount: number;
  createdAt: string;
}

/** Celebración: cumpleaños del mes, Navidad, Nochevieja u otra. */
export interface FamilyEvent extends Entity {
  title: string;
  kind: EventKind;
  startDate: string;
  endDate: string;
  place?: string;
  notes?: string;
  /** "YYYY-MM" en el cumpleaños del mes. */
  month?: string | null;
  pollId?: string | null;
  createdAt: string;
}

export interface EventRsvp extends Entity {
  eventId: string;
  familyId: string;
  memberId?: string;
  status: RsvpStatus;
  peopleCount: number;
  createdAt: string;
}

export interface EventItem extends Entity {
  eventId: string;
  name: string;
  quantity: string;
  memberId?: string;
  createdAt: string;
}
