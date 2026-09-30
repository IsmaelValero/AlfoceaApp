import { LoginForm } from "@/components/LoginForm";
import { login } from "@/app/login/actions";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-full flex-col justify-end overflow-hidden">
      {/* Fondo a pantalla completa; el logo ya viene en la imagen. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/login-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
      />

      <div className="relative z-10 w-full px-[max(1.15rem,env(safe-area-inset-left))] pr-[max(1.15rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4">
        <div className="rounded-[1.25rem] border border-white/70 bg-white/88 p-4 shadow-[0_12px_40px_rgb(52_66_58/0.12)] backdrop-blur-md">
          <LoginForm action={login} />
        </div>
      </div>
    </main>
  );
}
