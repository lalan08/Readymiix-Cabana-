"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { adjustDepotQuantityAction, setDepotQuantityAction } from "@/lib/actions/depot";
import { formatQty } from "@/lib/stock";

export function DepotStepper({ productId, quantity }: { productId: string; quantity: number }) {
  const [qty, setQty] = useState(quantity);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(quantity.toString());
  const [, startTransition] = useTransition();

  function step(delta: number) {
    const next = Math.max(0, qty + delta);
    setQty(next);
    startTransition(() => adjustDepotQuantityAction(productId, delta));
  }

  function submitDraft() {
    const parsed = parseFloat(draft.replace(",", "."));
    setEditing(false);
    if (Number.isNaN(parsed)) {
      setDraft(qty.toString());
      return;
    }
    setQty(parsed);
    startTransition(() => setDepotQuantityAction(productId, parsed));
  }

  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => step(-1)} disabled={qty <= 0} className="btn btn-secondary btn-icon tap-target !p-2 disabled:opacity-40">
        <Minus size={14} />
      </button>
      {editing ? (
        <input
          autoFocus
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={submitDraft}
          onKeyDown={(e) => e.key === "Enter" && submitDraft()}
          className="tap-target w-16 rounded-lg border border-[var(--color-palm-500)] px-1 text-center text-sm font-bold outline-none"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(qty.toString());
            setEditing(true);
          }}
          className="tap-target w-16 rounded-lg bg-[var(--color-sand-50)] text-center text-sm font-bold"
        >
          {formatQty(qty)}
        </button>
      )}
      <button onClick={() => step(1)} className="btn btn-primary btn-icon tap-target !p-2">
        <Plus size={14} />
      </button>
    </div>
  );
}
