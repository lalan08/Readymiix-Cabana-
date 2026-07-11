import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/UsersManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Gestion des utilisateurs</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Administrateur, responsables et employés autorisés à accéder à la page.
        </p>
      </div>

      <UsersManager
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active }))}
        currentUserId={session.id}
      />
    </div>
  );
}
