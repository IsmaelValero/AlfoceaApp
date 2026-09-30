import { LoginForm } from "@/components/LoginForm";
import { login } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="screen fill-phone flex flex-col justify-center">
      <header className="mb-8 flex justify-center">
        {/* img nativo: evita el optimizador de Next con rutas que tienen espacios. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/alfocea-logo.png"
          alt="Alfocea"
          width={220}
          height={220}
          className="h-auto w-[11.5rem] drop-shadow-sm sm:w-[13rem]"
        />
      </header>
      <LoginForm action={login} />
    </main>
  );
}
