import { prisma } from "@/lib/prisma";
import { ClosingInventory } from "@/components/ClosingInventory";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [products, lastSession] = await Promise.all([
    prisma.product.findMany({
      where: { archived: false },
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
    }),
    prisma.inventorySession.findFirst({
      where: { finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
      include: { user: true },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Inventaire de fermeture</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Vérifiez chaque catégorie et indiquez les quantités restantes en fin de service.
        </p>
        {lastSession && (
          <p className="mt-1 text-xs text-[var(--foreground)]/50">
            Dernier inventaire : {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(lastSession.finishedAt!)}
            {lastSession.user ? ` par ${lastSession.user.name}` : ""}
          </p>
        )}
      </div>

      <ClosingInventory
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          minQuantity: p.minQuantity,
          categoryId: p.categoryId,
          categoryName: p.category.name,
          categoryIcon: p.category.icon,
        }))}
      />
    </div>
  );
}
