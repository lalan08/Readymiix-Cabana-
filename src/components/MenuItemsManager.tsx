"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { createMenuItemAction, updateMenuItemAction, archiveMenuItemAction } from "@/lib/actions/menu";
import { formatPrice } from "@/lib/menu";

type MenuItem = { id: string; name: string; category: string; price: number };

export function MenuItemsManager({ items }: { items: MenuItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", price: "" });

  const grouped = new Map<string, MenuItem[]>();
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category)!.push(item);
  }

  function submitNew() {
    setError(null);
    startTransition(async () => {
      const res = await createMenuItemAction({
        name: form.name,
        category: form.category,
        price: parseFloat(form.price.replace(",", ".")),
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setForm({ name: "", category: "", price: "" });
      setShowForm(false);
      router.refresh();
    });
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({ name: item.name, category: item.category, price: item.price.toString() });
  }

  function submitEdit(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateMenuItemAction(id, {
        name: editForm.name,
        category: editForm.category,
        price: parseFloat(editForm.price.replace(",", ".")),
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Supprimer ce produit de la caisse ?")) return;
    startTransition(async () => {
      await archiveMenuItemAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary tap-target">
        <Plus size={16} /> Ajouter un produit
      </button>

      {showForm && (
        <div className="card space-y-3 p-4">
          <input
            placeholder="Nom (ex : Caïpirinha Fraise)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Catégorie (ex : Cocktails)"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Prix (€)"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="input"
          />
          {error && <p className="text-sm font-medium text-[var(--color-status-out)]">{error}</p>}
          <button onClick={submitNew} disabled={pending} className="btn btn-primary tap-target w-full">
            Ajouter
          </button>
        </div>
      )}

      {[...grouped.entries()].map(([category, categoryItems]) => (
        <section key={category} className="space-y-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">{category}</h2>
          <div className="card divide-y divide-[var(--border)] p-0">
            {categoryItems.map((item) =>
              editingId === item.id ? (
                <div key={item.id} className="space-y-2 p-4">
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="input"
                  />
                  <div className="flex gap-2">
                    <input
                      value={editForm.category}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className="input"
                    />
                    <input
                      inputMode="decimal"
                      value={editForm.price}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => submitEdit(item.id)} className="btn btn-primary tap-target flex-1 text-sm">
                      <Check size={14} /> Enregistrer
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary tap-target text-sm">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-[var(--foreground)]/50">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => startEdit(item)} className="btn btn-secondary btn-icon tap-target">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(item.id)} className="btn btn-danger btn-icon tap-target">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      ))}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: white;
          padding: 0.65rem 0.9rem;
          font-size: 0.95rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}
