import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) redirect("/dashboard");

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const site = await prisma.site.findFirst();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Paramètres</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Gérer les catégories de produits et les informations générales du stand.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
          Point de stock
        </h2>
        <div className="card p-4 text-sm">
          <p className="font-semibold">{site?.name ?? "Stand ReadyMiix Cabana"}</p>
          <p className="mt-1 text-[var(--foreground)]/60">
            L&apos;application est prévue pour accueillir plusieurs points de stock à l&apos;avenir.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">Catégories</h2>
        <CategoriesManager
          categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, productCount: c._count.products }))}
        />
      </section>
    </div>
  );
}
