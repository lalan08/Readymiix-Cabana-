"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, AlertTriangle, PartyPopper } from "lucide-react";
import { togglePrepItemAction, markServiceReadyAction, unmarkServiceReadyAction } from "@/lib/actions/prep";
import { UNIT_LABEL, formatQty } from "@/lib/stock";
import { PreparationPanel } from "@/components/PreparationPanel";
import type { Unit } from "@prisma/client";

export type PrepRow = {
  id: string;
  productName: string;
  posteName: string;
  unit: Unit;
  quantityNeeded: number;
  checked: boolean;
  depotQuantity: number;
};

export function PrepChecklist({ items, isReady }: { items: PrepRow[]; isReady: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPanel, setShowPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, PrepRow[]>();
    for (const item of items) {
      if (!map.has(item.posteName)) map.set(item.posteName, []);
      map.get(item.posteName)!.push(item);
    }
    return [...map.entries()];
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const allChecked = items.length > 0 && checkedCount === items.length;

  function toggle(id: string) {
    startTransition(async () => {
      await togglePrepItemAction(id);
      router.refresh();
    });
  }

  function handleReady() {
    setError(null);
    startTransition(async () => {
      try {
        await markServiceReadyAction();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      }
    });
  }

  function handleUnready() {
    startTransition(async () => {
      await unmarkServiceReadyAction();
      router.refresh();
    });
  }

  if (items.length === 0 && !isReady) {
    return (
      <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
        Aucun produit à remettre pour l&apos;instant. La liste apparaît dès qu&apos;un poste est clôturé.
      </div>
    );
  }

  if (isReady) {
    return (
      <div className="card space-y-4 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-status-ok-bg)]">
          <PartyPopper size={28} className="text-[var(--color-status-ok)]" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Stand prêt pour le service</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            {items.length} produit(s) préparé(s).
          </p>
        </div>
        <button onClick={handleUnready} disabled={pending} className="btn btn-outline tap-target w-full text-sm">
          Annuler la validation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      <div className="card flex items-center justify-between p-4 text-sm">
        <span className="text-[var(--foreground)]/60">Produits préparés</span>
        <span className="font-bold text-[var(--color-palm-700)]">
          {checkedCount} / {items.length}
        </span>
      </div>

      <button onClick={() => setShowPanel(true)} className="btn btn-secondary tap-target w-full text-sm">
        <ClipboardList size={16} /> Générer / imprimer la liste
      </button>

      {grouped.map(([posteName, posteItems]) => (
        <section key={posteName} className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
            {posteName}
          </h2>
          <div className="card divide-y divide-[var(--border)] p-0">
            {posteItems.map((item) => {
              const insufficient = !item.checked && item.depotQuantity < item.quantityNeeded;
              return (
                <label
                  key={item.id}
                  className="flex items-center gap-3 p-4 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggle(item.id)}
                    disabled={pending}
                    className="h-5 w-5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${item.checked ? "text-[var(--foreground)]/40 line-through" : ""}`}>
                      {formatQty(item.quantityNeeded)} {UNIT_LABEL[item.unit]} de {item.productName.toLowerCase()}
                    </p>
                    {insufficient && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-[var(--color-status-out)]">
                        <AlertTriangle size={12} /> Stock dépôt insuffisant
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      ))}

      {error && (
        <p className="rounded-xl bg-[var(--color-status-out-bg)] px-4 py-3 text-sm font-medium text-[var(--color-status-out)]">
          {error}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-16 z-20 px-4 md:bottom-4 md:pl-72">
        <button
          onClick={handleReady}
          disabled={pending || !allChecked}
          className="btn btn-primary tap-target mx-auto block w-full max-w-lg shadow-lg disabled:opacity-40"
        >
          Stand prêt pour le service
        </button>
      </div>

      {showPanel && (
        <PreparationPanel
          items={items.map((i) => ({
            productName: i.productName,
            quantity: i.quantityNeeded,
            unit: i.unit,
            posteName: i.posteName,
          }))}
          onClose={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}
