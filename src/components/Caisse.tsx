"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Minus, Trash2, RotateCcw, Banknote, CreditCard, X } from "lucide-react";
import { formatPrice } from "@/lib/menu";

type MenuItem = { id: string; name: string; category: string; price: number; photoUrl: string | null };
type CartLine = { id: string; name: string; price: number; qty: number };
type Payment = "ESPECES" | "CARTE" | null;

export function Caisse({ items }: { items: MenuItem[] }) {
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [payment, setPayment] = useState<Payment>(null);
  const [cashGiven, setCashGiven] = useState("");

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

  return (
    <div className="md:grid md:grid-cols-[340px_1fr] md:gap-6">
      {/* Ticket — sticky under the header on mobile, pinned in a side column on tablet/desktop */}
      <div className="sticky top-16 z-10 -mx-4 space-y-3 border-b border-[var(--border)] bg-[var(--background)]/97 px-4 pb-3 pt-2 backdrop-blur md:static md:mx-0 md:top-20 md:space-y-4 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:pt-0 md:backdrop-blur-none">
        <div className="card space-y-3 p-4 md:sticky md:top-20">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">
              Ticket {itemCount > 0 && <span className="text-[var(--foreground)]/50">· {itemCount} article(s)</span>}
            </h2>
            {lines.length > 0 && (
              <button onClick={handleCancel} className="btn btn-outline tap-target !px-3 !py-1.5 text-xs">
                <RotateCcw size={13} /> Nouvelle commande
              </button>
            )}
          </div>

          {lines.length === 0 ? (
            <p className="py-3 text-center text-sm text-[var(--foreground)]/50">
              Touchez un produit pour l&apos;ajouter au ticket.
            </p>
          ) : (
            <div className="max-h-40 space-y-1.5 overflow-y-auto md:max-h-64">
              {lines.map((line) => (
                <div key={line.id} className="flex items-center gap-2 rounded-xl bg-[var(--color-sand-50)] py-1.5 pl-2.5 pr-1.5">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">{line.name}</p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => changeQty(line.id, -1)} className="btn btn-secondary btn-icon tap-target !p-1">
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-bold">{line.qty}</span>
                    <button onClick={() => changeQty(line.id, 1)} className="btn btn-primary btn-icon tap-target !p-1">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="w-14 shrink-0 text-right text-sm font-bold">{formatPrice(line.price * line.qty)}</p>
                  <button
                    onClick={() => removeLine(line.id)}
                    className="btn btn-danger btn-icon tap-target shrink-0 !p-1"
                    aria-label="Supprimer l'article"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-2.5 text-lg font-extrabold text-[var(--color-palm-900)]">
            <span>Total à payer</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPayment("ESPECES")}
              disabled={lines.length === 0}
              className={`btn tap-target text-sm disabled:opacity-40 ${payment === "ESPECES" ? "btn-primary" : "btn-secondary"}`}
            >
              <Banknote size={16} /> Espèces
            </button>
            <button
              onClick={() => setPayment("CARTE")}
              disabled={lines.length === 0}
              className={`btn tap-target text-sm disabled:opacity-40 ${payment === "CARTE" ? "btn-primary" : "btn-secondary"}`}
            >
              <CreditCard size={16} /> Carte
            </button>
            <button onClick={handleCancel} disabled={lines.length === 0} className="btn btn-danger tap-target text-sm disabled:opacity-40">
              <X size={16} /> Annuler
            </button>
          </div>

          {payment === "ESPECES" && (
            <div className="space-y-2 rounded-xl bg-[var(--color-status-ok-bg)] p-3">
              <label className="text-xs font-semibold text-[var(--foreground)]/70">Montant donné par le client</label>
              <input
                autoFocus
                inputMode="decimal"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="0"
                className="tap-target w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-lg font-bold outline-none focus:border-[var(--color-palm-500)]"
              />
              {change !== null && (
                <p className={`text-lg font-extrabold ${change < 0 ? "text-[var(--color-status-out)]" : "text-[var(--color-status-ok)]"}`}>
                  {change < 0 ? "Il manque " : "Monnaie à rendre : "}
                  {formatPrice(Math.abs(change))}
                </p>
              )}
            </div>
          )}

          {payment === "CARTE" && (
            <p className="rounded-xl bg-[var(--color-status-ok-bg)] p-3 text-center text-sm font-semibold text-[var(--color-status-ok)]">
              Paiement par carte — {formatPrice(total)}
            </p>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {categories.map(([category]) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`tap-target shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                activeCategory === category
                  ? "bg-[var(--color-palm-600)] text-white"
                  : "bg-[var(--color-sand-100)] text-[var(--foreground)]/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products — the only part of the page that scrolls */}
      <div className="mt-4 min-w-0 md:mt-0">
        <div className="sticky top-20 z-10 -mx-4 hidden gap-2 overflow-x-auto bg-[var(--background)]/97 px-4 py-2 backdrop-blur md:-mx-0 md:flex md:px-0">
          {categories.map(([category]) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`tap-target shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                activeCategory === category
                  ? "bg-[var(--color-palm-600)] text-white"
                  : "bg-[var(--color-sand-100)] text-[var(--foreground)]/70"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-3 md:grid-cols-3 lg:grid-cols-4">
          {(categories.find(([c]) => c === activeCategory)?.[1] ?? []).map((item) => {
            return (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="card flex flex-col items-start gap-2 overflow-hidden p-0 pb-3 text-left transition-transform active:scale-[0.96]"
              >
                {item.photoUrl ? (
                  <div className="relative aspect-square w-full">
                    <Image src={item.photoUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-square w-full bg-[var(--color-sand-100)]" />
                )}
                <div className="flex flex-col gap-1 px-3">
                  <span className="text-sm font-semibold leading-tight">{item.name}</span>
                  <span className="text-sm font-bold text-[var(--color-coral-600)]">{formatPrice(item.price)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
