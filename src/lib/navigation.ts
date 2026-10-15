const MODULE_ROOTS = new Set(["/reservas", "/manuales", "/normas", "/familias", "/proyectos", "/inventario"]);

export type FabIcon = "home" | "widgets" | "book" | "calendar" | "shield" | "users" | "box" | "tasks" | "initial";

export interface FloatingNavConfig {
  href: string;
  icon: FabIcon;
  label: string;
}

/** Pantalla padre en la app. El atras sube por aqui, no por el historial del navegador. */
export function parentHref(pathname: string, search = ""): string | null {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const dia = params.get("dia");
  const dayQuery = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? `?dia=${dia}` : "";

  if (pathname === "/" || pathname === "/login") return null;
  if (pathname === "/modulos" || pathname === "/notificaciones" || pathname === "/perfil") return "/";
  if (/^\/perfil\/[^/]+$/.test(pathname)) return "/perfil";
  if (pathname === "/reservas/solicitar") return `/reservas${dayQuery}`;
  if (/^\/manuales\/seccion\/[^/]+$/.test(pathname)) return "/manuales";

  const member = pathname.match(/^\/familias\/([^/]+)\/miembros\/[^/]+$/);
  if (member) return `/familias/${member[1]}`;

  if (pathname === "/proyectos/nuevo" || pathname === "/proyectos/periodicas/nueva") return "/proyectos";
  const periodicEdit = pathname.match(/^\/proyectos\/periodicas\/([^/]+)\/editar$/);
  if (periodicEdit) return `/proyectos/periodicas/${periodicEdit[1]}`;
  if (/^\/proyectos\/periodicas\/[^/]+$/.test(pathname)) return "/proyectos";
  const taskEdit = pathname.match(/^\/proyectos\/([^/]+)\/tareas\/[^/]+\/editar$/);
  if (taskEdit) return `/proyectos/${taskEdit[1]}`;
  const taskNew = pathname.match(/^\/proyectos\/([^/]+)\/tareas\/nueva$/);
  if (taskNew) return `/proyectos/${taskNew[1]}`;
  const projectEdit = pathname.match(/^\/proyectos\/([^/]+)\/editar$/);
  if (projectEdit) return `/proyectos/${projectEdit[1]}`;
  if (/^\/proyectos\/[^/]+$/.test(pathname)) return "/proyectos";

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

/** Configura el boton flotante segun la pantalla. null = no se muestra. */
export function floatingNavFor(pathname: string): FloatingNavConfig | null {
  if (pathname === "/login") return null;
  if (pathname === "/") return { href: "/modulos", icon: "widgets", label: "Ir a los modulos de la app" };
  if (pathname === "/modulos") return { href: "/", icon: "home", label: "Volver a Inicio" };
  if (pathname === "/perfil" || pathname === "/notificaciones") {
    return { href: "/", icon: "home", label: "Volver a Inicio" };
  }
  if (/^\/perfil\/[^/]+$/.test(pathname)) {
    return { href: "/perfil", icon: "initial", label: "Volver al Perfil" };
  }

  if (/\/(solicitar|nueva|nuevo)$/.test(pathname) || /\/editar$/.test(pathname)) return null;
  if (/\/miembros\//.test(pathname)) return null;
  if (/^\/manuales\/(?!seccion\/)[^/]+$/.test(pathname)) return null;

  if (/^\/manuales\/seccion\/[^/]+$/.test(pathname)) {
    return { href: "/manuales", icon: "book", label: "Volver a Manuales" };
  }

  if (MODULE_ROOTS.has(pathname)) {
    return { href: "/modulos", icon: "widgets", label: "Volver a Modulos" };
  }

  if (/^\/reservas\/[^/]+$/.test(pathname)) {
    return { href: "/reservas", icon: "calendar", label: "Volver a Reservas" };
  }
  if (/^\/normas\/[^/]+$/.test(pathname)) {
    return { href: "/normas", icon: "shield", label: "Volver a Normas" };
  }
  if (/^\/familias\/[^/]+$/.test(pathname)) {
    return { href: "/familias", icon: "users", label: "Volver a Familias" };
  }
  if (/^\/proyectos\/periodicas\/[^/]+$/.test(pathname) || /^\/proyectos\/[^/]+$/.test(pathname)) {
    return { href: "/proyectos", icon: "tasks", label: "Volver a Proyectos" };
  }

  return null;
}
