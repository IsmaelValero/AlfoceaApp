const MODULE_ROOTS = new Set(["/reservas", "/manuales", "/normas", "/familias", "/proyectos", "/inventario"]);

/** Pantalla padre en la app. El atras sube por aqui, no por el historial del navegador. */
export function parentHref(pathname: string, search = ""): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const dia = params.get("dia");
  const dayQuery = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? `?dia=${dia}` : "";

  if (pathname === "/") return null;
  if (pathname === "/modulos" || pathname === "/notificaciones") return "/";
  if (pathname === "/reservas/solicitar") return `/reservas${dayQuery}`;

  const member = pathname.match(/^\/familias\/([^/]+)\/miembros\/[^/]+$/);
  if (member) return `/familias/${member[1]}`;

  const edit = pathname.match(/^\/(reservas|manuales|normas|familias)\/([^/]+)\/editar$/);
  if (edit) return `/${edit[1]}/${edit[2]}`;

  const create = pathname.match(/^\/(reservas|manuales|normas|familias)\/(?:nueva|nuevo)$/);
  if (create) return `/${create[1]}`;

  const detail = pathname.match(/^\/(reservas|manuales|normas|familias)\/[^/]+$/);
  if (detail) return `/${pathname.split("/")[1]}`;

  if (MODULE_ROOTS.has(pathname)) return "/modulos";

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 1) return `/${parts.slice(0, -1).join("/")}`;
  if (parts.length === 1) return "/";
  return null;
}
