"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Minus, Plus, ChevronDown } from "lucide-react";
import { submitPosteInventoryAction } from "@/lib/actions/inventory";
import { toBring, UNIT_LABEL, formatQty } from "@/lib/stock";
import type { Unit } from "@prisma/client";

type Product = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  targetQuantity: number;
  groupe: string | null;
};

export function PosteInventory({
  posteId,
  posteName,
  products,
  alreadyClosedToday,
}: {
  posteId: string;
  posteName: string;
  products: Product[];
  alreadyClosedToday: boolean;
}) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, string>>(
    Object.fromEntries(products.map((p) => [p.id, p.quantity.toString()]))
  );
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of products) {
      const key = p.groupe || "Produits";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()];
  }, [products]);

  function step(productId: string, delta: number) {
    setCounts((c) => {
      const current = parseFloat((c[productId] || "0").replace(",", ".")) || 0;
      const next = Math.max(0, current + delta);
      return { ...c, [productId]: next.toString() };
    });
  }

  function handleSubmit() {
    const lines = products.map((p) => ({
      productId: p.id,
      countedQty: parseFloat((counts[p.id] || "0").replace(",", ".")) || 0,
    }));
    startTransition(async () => {
      await submitPosteInventoryAction(posteId, lines);
      setDone(true);
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-ok-bg)]">
          <ClipboardCheck size={28} className="text-[var(--color-status-ok)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Poste clôturé</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            {posteName} est prêt. La liste de préparation a été mise à jour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {alreadyClosedToday && (
        <div className="rounded-xl bg-[var(--color-status-planned-bg)] px-4 py-3 text-sm font-medium text-[var(--color-status-planned)]">
          Ce poste a déjà été clôturé aujourd&apos;hui. Vous pouvez corriger les quantités et valider à nouveau.
        </div>
      )}

      {grouped.map(([groupe, items]) => (
        <details key={groupe} className="card group overflow-hidden p-0" open>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-bold">
            <span>{groupe}</span>
            <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-3 border-t border-[var(--border)] p-4">
            {items.map((p) => {
              const remaining = parseFloat((counts[p.id] || "0").replace(",", ".")) || 0;
              const bring = toBring(p.targetQuantity, remaining);
              return (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--foreground)]/50">
                      Cible : {formatQty(p.targetQuantity)} {UNIT_LABEL[p.unit]}
                      {bring > 0 && (
                        <span className="ml-1.5 font-semibold text-[var(--color-coral-600)]">
                          · à remettre : {formatQty(bring)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => step(p.id, -1)}
                      className="btn btn-secondary btn-icon tap-target !p-2"
                      aria-label="Retirer une unité"
                    >
                      <Minus size={15} />
                    </button>
                    <input
                      inputMode="decimal"
                      value={counts[p.id]}
                      onChange={(e) => setCounts((c) => ({ ...c, [p.id]: e.target.value }))}
                      className="tap-target w-16 rounded-lg border border-[var(--border)] px-1 text-center text-sm font-bold outline-none focus:border-[var(--color-palm-500)]"
                    />
                    <button
                      onClick={() => step(p.id, 1)}
                      className="btn btn-primary btn-icon tap-target !p-2"
                      aria-label="Ajouter une unité"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
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
          {pending ? "Validation..." : `Valider l'inventaire — ${posteName}`}
        </button>
      </div>
    </div>
  );
}
