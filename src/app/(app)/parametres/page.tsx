import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PostesManager } from "@/components/PostesManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [postes, users] = await Promise.all([
    prisma.poste.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Paramètres</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Gérer les postes et leur responsable. Changer le responsable ne touche ni aux
          produits, ni aux quantités, ni à l&apos;historique du poste.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">Postes</h2>
        <PostesManager
          postes={postes.map((p) => ({
            id: p.id,
            name: p.name,
            productCount: p._count.products,
            responsibleId: p.responsibleId,
          }))}
          users={users.map((u) => ({ id: u.id, name: u.name }))}
        />
      </section>
    </div>
  );
}
