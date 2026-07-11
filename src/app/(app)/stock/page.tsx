import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStockStatus, UNIT_LABEL } from "@/lib/stock";
import { StatusBadge } from "@/components/StatusBadge";
import { StockFilters } from "@/components/StockFilters";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { StockStatus } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string; statut?: string }>;
}) {
  const { q, categorie, statut } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        archived: false,
        ...(categorie ? { categoryId: categorie } : {}),
        ...(q ? { name: { contains: q } } : {}),
      },
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const filtered = statut
    ? products.filter((p) => getStockStatus(p.quantity, p.minQuantity) === (statut as StockStatus))
    : products;

  const grouped = new Map<string, typeof filtered>();
  for (const p of filtered) {
    const key = p.category.name;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Stock complet</h1>
        <Link href="/stock/nouveau" className="btn btn-primary tap-target shrink-0 text-sm">
          <Plus size={17} /> Ajouter
        </Link>
      </div>

      <StockFilters categories={categories} />

      <p className="text-sm text-[var(--foreground)]/60">
        {filtered.length} produit{filtered.length > 1 ? "s" : ""}
      </p>

      {filtered.length === 0 && (
        <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
          Aucun produit ne correspond à votre recherche.
        </div>
      )}

      <div className="space-y-6">
        {[...grouped.entries()].map(([categoryName, items]) => (
          <section key={categoryName} className="space-y-2.5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
              <span>{items[0].category.icon}</span> {categoryName}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => {
                const status = getStockStatus(product.quantity, product.minQuantity);
                return (
                  <div key={product.id} className="card space-y-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{product.name}</p>
                        {product.location && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--foreground)]/55">
                            <MapPin size={12} /> {product.location}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={status} compact />
                    </div>

                    <p className="text-xs text-[var(--foreground)]/55">
                      Seuil minimum : {product.minQuantity} {UNIT_LABEL[product.unit]}
                    </p>

                    <QuantityStepper
                      productId={product.id}
                      quantity={product.quantity}
                      unit={product.unit}
                      editHref={`/stock/${product.id}/modifier`}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
