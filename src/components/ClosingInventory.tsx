"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, ChevronDown } from "lucide-react";
import { submitClosingInventoryAction } from "@/lib/actions/inventory";
import { getStockStatus, UNIT_LABEL } from "@/lib/stock";
import type { Unit } from "@prisma/client";

type Product = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  minQuantity: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
};

export function ClosingInventory({ products }: { products: Product[] }) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries(products.map((p) => [p.id, p.quantity.toString()]))
  );
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ruptures: number; total: number } | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = p.categoryName;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()];
  }, [products]);

  const touchedCount = products.filter(
    (p) => parseFloat(counts[p.id] || "0") !== p.quantity
  ).length;

  function handleSubmit() {
    const lines = products.map((p) => ({
      productId: p.id,
      countedQty: parseFloat((counts[p.id] || "0").replace(",", ".")) || 0,
    }));
    const ruptures = lines.filter((l) => l.countedQty <= 0).length;

    startTransition(async () => {
      await submitClosingInventoryAction(lines);
      setResult({ ruptures, total: lines.length });
      router.refresh();
    });
  }

  if (result) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-ok-bg)]">
          <ClipboardCheck size={28} className="text-[var(--color-status-ok)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Inventaire validé</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            {result.total} produits vérifiés · {result.ruptures} en rupture identifiée(s)
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a href="/reappro" className="btn btn-primary tap-target flex-1">
            Voir le réapprovisionnement
          </a>
          <a href="/stock" className="btn btn-secondary tap-target flex-1">
            Voir le stock
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="card flex items-center justify-between p-4 text-sm">
        <span className="text-[var(--foreground)]/60">Produits modifiés</span>
        <span className="font-bold text-[var(--color-palm-700)]">
          {touchedCount} / {products.length}
        </span>
      </div>

      {grouped.map(([categoryName, items]) => (
        <details key={categoryName} className="card group overflow-hidden p-0" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-bold">
            <span>
              {items[0].categoryIcon} {categoryName}
            </span>
            <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-2 border-t border-[var(--border)] p-4">
            {items.map((p) => {
              const counted = parseFloat((counts[p.id] || "0").replace(",", "."));
              const status = getStockStatus(Number.isNaN(counted) ? 0 : counted, p.minQuantity);
              return (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--foreground)]/50">
                      Avant : {p.quantity} {UNIT_LABEL[p.unit]}
                    </p>
                  </div>
                  <input
                    inputMode="decimal"
                    value={counts[p.id]}
                    onChange={(e) => setCounts((c) => ({ ...c, [p.id]: e.target.value }))}
                    className={`tap-target w-20 rounded-lg border px-2 text-center text-sm font-bold outline-none ${
                      status === "RUPTURE"
                        ? "border-[var(--color-status-out)] text-[var(--color-status-out)]"
                        : status === "FAIBLE"
                          ? "border-[var(--color-status-low)] text-[var(--color-status-low)]"
                          : "border-[var(--border)]"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </details>
      ))}

      <div className="fixed inset-x-0 bottom-16 z-20 px-4 md:bottom-4 md:pl-72">
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="btn btn-primary tap-target mx-auto block w-full max-w-lg shadow-lg disabled:opacity-60"
        >
          {pending ? "Validation..." : "Valider l'inventaire de fermeture"}
        </button>
      </div>
    </div>
  );
}
