import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [users, postes] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.poste.findMany({ where: { responsibleId: { not: null } } }),
  ]);

  const posteByUser = new Map(postes.map((p) => [p.responsibleId as string, p.name]));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Gestion des utilisateurs</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Allan et Talia ont accès à tout. Les employés n&apos;accèdent qu&apos;à leur poste — pour
          changer qui est responsable d&apos;un poste, voir{" "}
          <Link href="/parametres" className="underline">
            Paramètres
          </Link>
          .
        </p>
      </div>

      <UsersManager
        users={users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          active: u.active,
          posteName: posteByUser.get(u.id) ?? null,
        }))}
        currentUserId={session.id}
      />
    </div>
  );
}
