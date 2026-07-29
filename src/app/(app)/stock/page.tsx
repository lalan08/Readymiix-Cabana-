import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { UNIT_LABEL, formatQty } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const postes = await prisma.poste.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        where: { archived: false },
        orderBy: [{ groupe: "asc" }, { name: "asc" }],
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Produits</h1>
        <Link href="/stock/nouveau" className="btn btn-primary tap-target shrink-0 text-sm">
          <Plus size={17} /> Ajouter
        </Link>
      </div>

      {postes.map((poste) => (
        <section key={poste.id} className="space-y-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
            {poste.name} · {poste.products.length} produit(s)
          </h2>
          <div className="card divide-y divide-[var(--border)] p-0">
            {poste.products.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-[var(--foreground)]/50">
                    {p.groupe ? `${p.groupe} · ` : ""}
                    Cible {formatQty(p.targetQuantity)} {UNIT_LABEL[p.unit]} · Restant {formatQty(p.quantity)} · Dépôt{" "}
                    {formatQty(p.depotQuantity)}
                  </p>
                </div>
                <Link href={`/stock/${p.id}/modifier`} className="btn btn-secondary btn-icon tap-target shrink-0">
                  <Pencil size={15} />
                </Link>
              </div>
            ))}
            {poste.products.length === 0 && (
              <p className="p-4 text-sm text-[var(--foreground)]/50">Aucun produit dans ce poste.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
