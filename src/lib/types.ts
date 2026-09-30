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
  { value: "adulto", label: "Adulto", description: "Puede reservar y crear tareas" },
  { value: "joven", label: "Joven", description: "Puede consultar y apuntarse a reservas" },
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
