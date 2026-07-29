import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { todayDateOnly } from "@/lib/postes";
import { UNIT_LABEL, formatQty } from "@/lib/stock";
import { DepotStepper } from "@/components/DepotStepper";

export const dynamic = "force-dynamic";

export default async function DepotPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const date = todayDateOnly();

  const [postes, toBuy] = await Promise.all([
    prisma.poste.findMany({
      orderBy: { order: "asc" },
      include: { products: { where: { archived: false }, orderBy: { name: "asc" } } },
    }),
    prisma.prepItem.findMany({
      where: { date, checked: false },
      include: { product: true, poste: true },
    }),
  ]);

  const insufficientItems = toBuy.filter((i) => i.product.depotQuantity < i.quantityNeeded);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Stock du dépôt</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Quantités disponibles au dépôt, déduites automatiquement lors de la préparation.
        </p>
      </div>

      {insufficientItems.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-[var(--color-status-out)]">
            <AlertTriangle size={15} /> À acheter
          </h2>
          <div className="card divide-y divide-[var(--border)] p-0">
            {insufficientItems.map((i) => (
              <div key={i.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{i.product.name}</p>
                  <p className="text-xs text-[var(--foreground)]/50">{i.poste.name}</p>
                </div>
                <p className="text-xs font-semibold text-[var(--color-status-out)]">
                  Besoin {formatQty(i.quantityNeeded)} · dépôt {formatQty(i.product.depotQuantity)}{" "}
                  {UNIT_LABEL[i.product.unit]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {postes.map((poste) => (
        <section key={poste.id} className="space-y-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
            {poste.name}
          </h2>
          <div className="card divide-y divide-[var(--border)] p-0">
            {poste.products.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-[var(--foreground)]/50">{UNIT_LABEL[p.unit]}</p>
                </div>
                <DepotStepper productId={p.id} quantity={p.depotQuantity} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
