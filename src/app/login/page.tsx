import { LoginForm } from "@/components/LoginForm";
import { login } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="screen fill-phone flex flex-col justify-center">
      <header className="mb-8 text-center">
        <p className="section-title">Alfocea</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Entra</h1>
        <p className="mt-2 text-sm text-muted">Usa tu usuario y contraseña.</p>
      </header>
      <LoginForm action={login} />
    </main>
  );
}
