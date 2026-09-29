import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="screen flex min-h-full flex-col items-center justify-center py-16 text-center">
      <p className="section-title">Alfocea</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Esta pagina no existe</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        Puede que el contenido se haya eliminado o que el enlace este mal escrito.
      </p>
      <div className="mt-6">
        <LinkButton href="/">Volver a Inicio</LinkButton>
      </div>
    </main>
  );
}
