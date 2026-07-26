"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, RotateCcw, Banknote, CreditCard, X, Check } from "lucide-react";
import { formatPrice } from "@/lib/menu";
import { recordSaleAction } from "@/lib/actions/sales";

type MenuItem = { id: string; name: string; category: string; price: number; photoUrl: string | null };
type CartLine = { id: string; name: string; price: number; qty: number };
type Payment = "ESPECES" | "CARTE" | null;

export function Caisse({ items }: { items: MenuItem[] }) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [payment, setPayment] = useState<Payment>(null);
  const [cashGiven, setCashGiven] = useState("");
  const [checkingOut, startCheckout] = useTransition();
  const [saleError, setSaleError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const categories = useMemo(() => {
    const seen = new Map<string, MenuItem[]>();
    for (const item of items) {
      if (!seen.has(item.category)) seen.set(item.category, []);
      seen.get(item.category)!.push(item);
    }
    return [...seen.entries()];
  }, [items]);

  const [activeCategory, setActiveCategory] = useState(categories[0]?.[0] ?? "");

  const lines = Object.values(cart);
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const cashAmount = parseFloat(cashGiven.replace(",", "."));
  const change = payment === "ESPECES" && !Number.isNaN(cashAmount) ? cashAmount - total : null;
  const canCheckout = lines.length > 0 && payment !== null && (payment !== "ESPECES" || (change !== null && change >= 0));

  function addItem(item: MenuItem) {
    setCart((c) => {
      const existing = c[item.id];
      return {
        ...c,
        [item.id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { id: item.id, name: item.name, price: item.price, qty: 1 },
      };
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((c) => {
      const line = c[id];
      if (!line) return c;
      const nextQty = line.qty + delta;
      if (nextQty <= 0) {
        const rest = { ...c };
        delete rest[id];
        return rest;
      }
      return { ...c, [id]: { ...line, qty: nextQty } };
    });
  }

  function removeLine(id: string) {
    setCart((c) => {
      const rest = { ...c };
      delete rest[id];
      return rest;
    });
  }

  function resetOrder() {
    setCart({});
    setPayment(null);
    setCashGiven("");
  }

  function handleCancel() {
    if (lines.length > 0 && !confirm("Annuler la commande en cours ?")) return;
    resetOrder();
  }

  function handleCheckout() {
    if (!payment || !canCheckout) return;
    setSaleError(null);
    startCheckout(async () => {
      try {
        const res = await recordSaleAction({
          items: lines.map((l) => ({ menuItemId: l.id, name: l.name, price: l.price, quantity: l.qty })),
          paymentMethod: payment,
        });
        if (res.error) {
          setSaleError(res.error);
          return;
        }
        resetOrder();
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      } catch {
        setSaleError("Échec de l'enregistrement de la vente. Réessayez.");
      }
    });
  }

  return (
    <div className="grid grid-cols-[1fr_128px] gap-2 sm:grid-cols-[1fr_200px] sm:gap-4 md:grid-cols-[1fr_340px] md:gap-6">
      {/* Products — the only part of the page that scrolls */}
      <div className="order-1 min-w-0">
        <div className="sticky top-16 z-10 -mx-3 flex gap-1.5 overflow-x-auto bg-[var(--background)]/97 px-3 py-2 backdrop-blur sm:gap-2 sm:py-2.5 md:-mx-0 md:px-0">
          {categories.map(([category]) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`tap-target shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${
                activeCategory === category
                  ? "bg-[var(--color-palm-600)] text-white"
                  : "bg-[var(--color-sand-100)] text-[var(--foreground)]/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2 sm:gap-3">
          {(categories.find(([c]) => c === activeCategory)?.[1] ?? []).map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="card flex flex-col items-start gap-1 overflow-hidden p-0 pb-2 text-left transition-transform active:scale-[0.96] sm:gap-1.5 sm:pb-3"
              >
                {item.photoUrl ? (
                  <div className="relative aspect-square w-full">
                    <Image src={item.photoUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-[var(--color-sand-100)]" />
                )}
                <div className="flex flex-col gap-0.5 px-2 sm:px-3">
                  <span className="text-[11px] font-semibold leading-tight sm:text-sm">{item.name}</span>
                  <span className="text-[11px] font-bold text-[var(--color-coral-600)] sm:text-sm">{formatPrice(item.price)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ticket — permanently visible in a right-hand column, sticky under the header */}
      <div className="order-2 min-w-0">
        <div className="card sticky top-16 space-y-2 p-2 sm:space-y-3 sm:p-3 md:top-20 md:p-4">
          <div className="flex items-center justify-between gap-1">
            <h2 className="text-xs font-bold sm:text-base">
              Ticket{itemCount > 0 && <span className="text-[var(--foreground)]/50"> · {itemCount}</span>}
            </h2>
            {lines.length > 0 && (
              <button
                onClick={handleCancel}
                aria-label="Nouvelle commande"
                className="btn btn-outline tap-target !p-1.5 text-xs sm:!px-3 sm:!py-1.5"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Nouvelle commande</span>
              </button>
            )}
          </div>

          {lines.length === 0 ? (
            <p className="py-2 text-center text-[11px] text-[var(--foreground)]/50 sm:text-sm">
              Touchez un produit pour l&apos;ajouter.
            </p>
          ) : (
            <div className="max-h-48 space-y-1.5 overflow-y-auto sm:max-h-64">
              {lines.map((line) => (
                <div key={line.id} className="space-y-1 rounded-lg bg-[var(--color-sand-50)] p-1.5 sm:rounded-xl sm:p-2">
                  <div className="flex items-start justify-between gap-1">
                    <p className="min-w-0 flex-1 truncate text-[11px] font-medium leading-tight sm:text-sm">{line.name}</p>
                    <p className="shrink-0 text-[11px] font-bold sm:text-sm">{formatPrice(line.price * line.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => changeQty(line.id, -1)} className="btn btn-secondary btn-icon tap-target !p-1">
                      <Minus size={11} />
                    </button>
                    <span className="w-4 text-center text-[11px] font-bold sm:text-sm">{line.qty}</span>
                    <button onClick={() => changeQty(line.id, 1)} className="btn btn-primary btn-icon tap-target !p-1">
                      <Plus size={11} />
                    </button>
                    <button
                      onClick={() => removeLine(line.id)}
                      className="btn btn-danger btn-icon tap-target ml-auto !p-1"
                      aria-label="Supprimer l'article"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[var(--border)] pt-2 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground)]/50 sm:text-sm sm:normal-case sm:tracking-normal">
              Total
            </p>
            <p className="text-lg font-extrabold text-[var(--color-palm-900)] sm:text-lg">{formatPrice(total)}</p>
          </div>

          <div className="flex flex-col gap-1.5 sm:grid sm:grid-cols-3 sm:gap-2">
            <button
              onClick={() => setPayment("ESPECES")}
              disabled={lines.length === 0}
              className={`btn tap-target text-xs disabled:opacity-40 sm:text-sm ${payment === "ESPECES" ? "btn-primary" : "btn-secondary"}`}
            >
              <Banknote size={15} /> Espèces
            </button>
            <button
              onClick={() => setPayment("CARTE")}
              disabled={lines.length === 0}
              className={`btn tap-target text-xs disabled:opacity-40 sm:text-sm ${payment === "CARTE" ? "btn-primary" : "btn-secondary"}`}
            >
              <CreditCard size={15} /> Carte
            </button>
            <button onClick={handleCancel} disabled={lines.length === 0} className="btn btn-danger tap-target text-xs disabled:opacity-40 sm:text-sm">
              <X size={15} /> Annuler
            </button>
          </div>

          {payment === "ESPECES" && (
            <div className="space-y-1.5 rounded-lg bg-[var(--color-status-ok-bg)] p-2 sm:rounded-xl sm:p-3">
              <label className="text-[10px] font-semibold text-[var(--foreground)]/70 sm:text-xs">Montant donné</label>
              <input
                autoFocus
                inputMode="decimal"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="0"
                className="tap-target w-full rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-base font-bold outline-none focus:border-[var(--color-palm-500)] sm:px-3 sm:py-2 sm:text-lg"
              />
              {change !== null && (
                <p className={`text-sm font-extrabold sm:text-lg ${change < 0 ? "text-[var(--color-status-out)]" : "text-[var(--color-status-ok)]"}`}>
                  {change < 0 ? "Manque " : "Rendre : "}
                  {formatPrice(Math.abs(change))}
                </p>
              )}
            </div>
          )}

          {payment === "CARTE" && (
            <p className="rounded-lg bg-[var(--color-status-ok-bg)] p-2 text-center text-xs font-semibold text-[var(--color-status-ok)] sm:rounded-xl sm:p-3 sm:text-sm">
              Carte — {formatPrice(total)}
            </p>
          )}

          {payment && (
            <button
              onClick={handleCheckout}
              disabled={!canCheckout || checkingOut}
              className="btn btn-primary tap-target w-full text-xs disabled:opacity-40 sm:text-sm"
            >
              <Check size={15} /> {checkingOut ? "Enregistrement..." : "Encaisser"}
            </button>
          )}

          {saleError && (
            <p className="text-center text-[11px] font-medium text-[var(--color-status-out)] sm:text-xs">{saleError}</p>
          )}

          {justSaved && (
            <p className="rounded-lg bg-[var(--color-status-ok-bg)] p-2 text-center text-xs font-semibold text-[var(--color-status-ok)] sm:rounded-xl sm:p-3 sm:text-sm">
              Vente enregistrée ✅
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
