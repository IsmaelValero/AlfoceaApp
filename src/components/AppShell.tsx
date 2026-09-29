"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BootScreen } from "@/components/BootScreen";
import { FloatingNav } from "@/components/FloatingNav";
import { floatingNavFor, parentHref } from "@/lib/navigation";

const MARK_COOKIE = "alfocea_mark";

function splitHref(href: string) {
  const query = href.indexOf("?");
  if (query === -1) return { pathname: href, search: "" };
  return { pathname: href.slice(0, query), search: href.slice(query + 1) };
}

function readMark() {
  if (typeof document === "undefined") return "?";
  const match = document.cookie.match(new RegExp(`(?:^|; )${MARK_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "?";
}

/**
 * Marco de telefono. En el ordenador se ve como un movil en vertical.
 * En un telefono real ocupa toda la pantalla y, en apaisado, se abre a lo ancho.
 * El boton flotante vive fuera del scroll y cambia segun la pantalla.
 * El atras del movil sube a la pantalla padre, no al historial.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const search = useSearchParams().toString();
  const router = useRouter();
  const fab = floatingNavFor(path);
  const [mark, setMark] = useState("?");
  const here = search ? `${path}?${search}` : path;
  const currentRef = useRef(here);
  const previousRef = useRef(here);

  if (currentRef.current !== here) {
    previousRef.current = currentRef.current;
    currentRef.current = here;
  }

  useEffect(() => {
    setMark(readMark());
  }, [path]);

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
      <div className={["phone", fab ? "has-nav" : ""].filter(Boolean).join(" ")}>
        <div className="phone-scroll">{children}</div>
        {fab ? <FloatingNav href={fab.href} icon={fab.icon} label={fab.label} mark={mark} /> : null}
        <BootScreen />
      </div>
    </div>
  );
}
