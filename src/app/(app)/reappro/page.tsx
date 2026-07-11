import { prisma } from "@/lib/prisma";
import { ReplenishmentList } from "@/components/ReplenishmentList";
import { ensureReplenishmentSync } from "@/lib/replenishment-sync";

export const dynamic = "force-dynamic";

export default async function ReplenishmentPage() {
  await ensureReplenishmentSync();

  const items = await prisma.replenishmentItem.findMany({
    where: { status: { not: "TERMINE" } },
    include: { product: true },
    orderBy: [{ urgency: "desc" }, { createdAt: "asc" }],
  });

  const rows = items.map((i) => ({
    id: i.id,
    productName: i.product.name,
    unit: i.product.unit,
    quantity: i.product.quantity,
    minQuantity: i.product.minQuantity,
    recommendedQty: i.recommendedQty,
    urgency: i.urgency,
    status: i.status,
    comment: i.comment,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Réapprovisionnement</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Produits à préparer ou à acheter pour refaire le stock du stand.
        </p>
      </div>

      <ReplenishmentList items={rows} />
    </div>
  );
}
