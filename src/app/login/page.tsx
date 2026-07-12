import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-end overflow-hidden px-4 pb-12 pt-10 sm:justify-center">
      <Image
        src="/brand/cabana-sunset.jpg"
        alt="ReadyMiix Cabana"
        fill
        priority
        className="z-0 object-cover"
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/25 via-black/20 to-black/75" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
        <h1 className="mb-1 text-xl font-bold text-[var(--color-palm-900)]">Connexion</h1>
        <p className="mb-6 text-sm text-[var(--foreground)]/70">
          Accès réservé au personnel autorisé du stand.
        </p>
        <LoginForm next={next ?? "/dashboard"} />
      </div>

      <p className="relative z-10 mt-8 text-center text-xs text-white/80">
        Stock ReadyMiix Cabana &middot; espace privé
      </p>
    </div>
  );
}
