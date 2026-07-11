"use client";

import { useState, useTransition } from "react";
import { Minus, Plus, Check, AlertTriangle, ClipboardPlus, Pencil } from "lucide-react";
import Link from "next/link";
import {
  adjustQuantityAction,
  setQuantityAction,
  reportRuptureAction,
  addToReplenishmentAction,
} from "@/lib/actions/products";
import { formatQty, UNIT_LABEL } from "@/lib/stock";
import type { Unit } from "@prisma/client";

export function QuantityStepper({
  productId,
  quantity,
  unit,
  editHref,
}: {
  productId: string;
  quantity: number;
  unit: Unit;
  editHref: string;
}) {
  const [qty, setQty] = useState(quantity);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(quantity.toString());
  const [pending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);

  function flash() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 900);
  }

  function step(delta: number) {
    const next = Math.max(0, qty + delta);
    setQty(next);
    startTransition(async () => {
      await adjustQuantityAction(productId, delta);
      flash();
    });
  }

  function submitDraft() {
    const parsed = parseFloat(draft.replace(",", "."));
    if (Number.isNaN(parsed)) {
      setEditing(false);
      setDraft(qty.toString());
      return;
    }
    setQty(parsed);
    setEditing(false);
    startTransition(async () => {
      await setQuantityAction(productId, parsed);
      flash();
    });
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => step(-1)}
          disabled={pending || qty <= 0}
          className="btn btn-secondary btn-icon tap-target disabled:opacity-40"
          aria-label="Retirer une unité"
        >
          <Minus size={18} />
        </button>

        {editing ? (
          <input
            autoFocus
            inputMode="decimal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={submitDraft}
            onKeyDown={(e) => e.key === "Enter" && submitDraft()}
            className="tap-target w-20 rounded-lg border border-[var(--color-palm-500)] px-2 text-center text-lg font-bold outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(qty.toString());
              setEditing(true);
            }}
            className={`tap-target flex min-w-20 flex-col items-center justify-center rounded-lg px-2 transition-colors ${
              savedFlash ? "bg-[var(--color-status-ok-bg)]" : "bg-[var(--color-sand-50)]"
            }`}
          >
            <span className="text-lg font-extrabold leading-none">{formatQty(qty)}</span>
            <span className="text-[10px] text-[var(--foreground)]/50">{UNIT_LABEL[unit]}</span>
          </button>
        )}

        <button
          onClick={() => step(1)}
          disabled={pending}
          className="btn btn-primary btn-icon tap-target disabled:opacity-40"
          aria-label="Ajouter une unité"
        >
          <Plus size={18} />
        </button>

        {savedFlash && <Check size={16} className="text-[var(--color-status-ok)]" />}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() =>
            startTransition(async () => {
              await reportRuptureAction(productId);
              setQty(0);
              flash();
            })
          }
          className="btn btn-danger tap-target !px-2.5 !py-1.5 text-xs"
        >
          <AlertTriangle size={14} /> Rupture
        </button>
        <button
          onClick={() =>
            startTransition(async () => {
              await addToReplenishmentAction(productId);
              flash();
            })
          }
          className="btn btn-secondary tap-target !px-2.5 !py-1.5 text-xs"
        >
          <ClipboardPlus size={14} /> Réappro
        </button>
        <Link href={editHref} className="btn btn-outline tap-target !px-2.5 !py-1.5 text-xs">
          <Pencil size={14} /> Modifier
        </Link>
      </div>
    </div>
  );
}
