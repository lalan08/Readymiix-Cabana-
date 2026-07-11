import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-sand-50)] px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-3">
        <Logo size={64} textClassName="text-center text-lg" />
      </div>

      <div className="card w-full max-w-sm p-6 sm:p-8">
        <h1 className="mb-1 text-xl font-bold text-[var(--color-palm-900)]">Connexion</h1>
        <p className="mb-6 text-sm text-[var(--foreground)]/70">
          Accès réservé au personnel autorisé du stand.
        </p>
        <LoginForm next={next ?? "/dashboard"} />
      </div>

      <p className="mt-8 text-center text-xs text-[var(--foreground)]/50">
        Stock ReadyMiix Cabana &middot; espace privé
      </p>
    </div>
  );
}
