"use client";

import { useMemo, useState, useTransition } from "react";
import { ClipboardList, Trash2 } from "lucide-react";
import {
  bulkUpdateReplenishmentStatusAction,
  updateReplenishmentStatusAction,
  removeReplenishmentItemAction,
} from "@/lib/actions/replenishment";
import {
  REPLENISHMENT_STATUS_LABEL,
  REPLENISHMENT_STATUS_ORDER,
  URGENCY_LABEL,
  URGENCY_COLOR,
} from "@/lib/replenishment";
import { UNIT_LABEL, formatQty } from "@/lib/stock";
import { PreparationPanel } from "@/components/PreparationPanel";
import type { ReplenishmentStatus, Unit, Urgency } from "@prisma/client";

export type ReplenishmentRow = {
  id: string;
  productName: string;
  unit: Unit;
  quantity: number;
  minQuantity: number;
  recommendedQty: number;
  urgency: Urgency;
  status: ReplenishmentStatus;
  comment: string | null;
};

export function ReplenishmentList({ items }: { items: ReplenishmentRow[] }) {
  const [filter, setFilter] = useState<ReplenishmentStatus | "TOUS">("TOUS");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(false);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "TOUS" ? items : items.filter((i) => i.status === filter)),
    [items, filter]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id))
    );
  }

  function bulkSet(status: ReplenishmentStatus) {
    const ids = [...selected];
    if (ids.length === 0) return;
    startTransition(async () => {
      await bulkUpdateReplenishmentStatusAction(ids, status);
      setSelected(new Set());
    });
  }

  const selectedItems = items.filter((i) => selected.has(i.id));
  const panelItems = (selectedItems.length > 0 ? selectedItems : filtered).map((i) => ({
    productName: i.productName,
    quantity: i.recommendedQty,
    unit: i.unit,
  }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["TOUS", ...REPLENISHMENT_STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`tap-target shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              filter === s
                ? "bg-[var(--color-palm-600)] text-white"
                : "bg-[var(--color-sand-100)] text-[var(--foreground)]/70"
            }`}
          >
            {s === "TOUS" ? "Tous" : REPLENISHMENT_STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filtered.length > 0 && selected.size === filtered.length}
            onChange={toggleAll}
            className="h-4 w-4"
          />
          Tout sélectionner ({filtered.length})
        </label>
        <button
          onClick={() => setShowPanel(true)}
          className="btn btn-primary tap-target text-sm"
        >
          <ClipboardList size={16} /> Générer la liste de préparation
        </button>
      </div>

      {selected.size > 0 && (
        <div className="card flex flex-wrap items-center gap-2 p-3">
          <span className="text-sm font-medium">{selected.size} sélectionné(s) :</span>
          <button disabled={pending} onClick={() => bulkSet("PRET")} className="btn btn-secondary tap-target text-xs">
            Marquer préparé
          </button>
          <button disabled={pending} onClick={() => bulkSet("TRANSFERE")} className="btn btn-primary tap-target text-xs">
            Marquer livré / transféré
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
          Aucun produit dans cette liste.
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <input
              type="checkbox"
              checked={selected.has(item.id)}
              onChange={() => toggle(item.id)}
              className="mt-1 h-4 w-4 shrink-0 sm:mt-0"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{item.productName}</p>
                <span className={`status-pill ${URGENCY_COLOR[item.urgency]}`}>
                  {URGENCY_LABEL[item.urgency]}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[var(--foreground)]/60">
                Restant : {formatQty(item.quantity)} {UNIT_LABEL[item.unit]} · Minimum :{" "}
                {formatQty(item.minQuantity)} {UNIT_LABEL[item.unit]} · À reprendre :{" "}
                <strong>
                  {formatQty(item.recommendedQty)} {UNIT_LABEL[item.unit]}
                </strong>
              </p>
              {item.comment && <p className="mt-1 text-xs italic text-[var(--foreground)]/50">{item.comment}</p>}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={item.status}
                onChange={(e) =>
                  startTransition(() =>
                    updateReplenishmentStatusAction(item.id, e.target.value as ReplenishmentStatus)
                  )
                }
                className="tap-target rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-xs"
              >
                {REPLENISHMENT_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {REPLENISHMENT_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => startTransition(() => removeReplenishmentItemAction(item.id))}
                className="btn btn-icon btn-secondary tap-target"
                aria-label="Retirer de la liste"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPanel && <PreparationPanel items={panelItems} onClose={() => setShowPanel(false)} />}
    </div>
  );
}
