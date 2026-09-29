"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FloatingNav } from "@/components/FloatingNav";
import { parentHref } from "@/lib/navigation";

function splitHref(href: string) {
  const query = href.indexOf("?");
  if (query === -1) return { pathname: href, search: "" };
  return { pathname: href.slice(0, query), search: href.slice(query + 1) };
}

/**
 * Marco de telefono. En el ordenador se ve como un movil en vertical.
 * En un telefono real ocupa toda la pantalla y, en apaisado, se abre a lo ancho.
 * El boton de Inicio/Modulos vive fuera del scroll para quedarse centrado.
 * El atras del movil sube a la pantalla padre, no al historial.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const search = useSearchParams().toString();
  const router = useRouter();
  const navRight = path === "/";
  const navLeft = path === "/modulos";
  const here = search ? `${path}?${search}` : path;
  const currentRef = useRef(here);
  const previousRef = useRef(here);

  if (currentRef.current !== here) {
    previousRef.current = currentRef.current;
    currentRef.current = here;
  }

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const landed = window.location.pathname + window.location.search;
      const origin = currentRef.current === landed ? previousRef.current : currentRef.current;
      const place = splitHref(origin);
      const dest = parentHref(place.pathname, place.search);
      if (!dest || landed === dest) return;

      event.stopImmediatePropagation();
      window.setTimeout(() => {
        if (window.location.pathname + window.location.search === dest) return;
        router.replace(dest);
      }, 0);
    };

    window.addEventListener("popstate", onPopState, true);
    return () => window.removeEventListener("popstate", onPopState);
  }, [router]);

  return (
    <div className="app-stage">
      <div className={["phone", navRight ? "has-nav-right" : "", navLeft ? "has-nav-left" : ""].filter(Boolean).join(" ")}>
        <div className="phone-scroll">{children}</div>
        {navRight ? <FloatingNav href="/modulos" icon="widgets" label="Ir a los modulos de la app" /> : null}
        {navLeft ? <FloatingNav href="/" icon="home" label="Volver a Inicio" /> : null}
      </div>
    </div>
  );
}
