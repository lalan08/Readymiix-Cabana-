"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Check, Pencil } from "lucide-react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/lib/actions/categories";

type Category = { id: string; name: string; icon: string; productCount: number };

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const res = await createCategoryAction(name, icon);
      if (res.error) {
        setError(res.error);
        return;
      }
      setName("");
      setIcon("📦");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    startTransition(async () => {
      const res = await deleteCategoryAction(id);
      if (res.error) alert(res.error);
      router.refresh();
    });
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await updateCategoryAction(id, { name: editValue });
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-2 p-4">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={2}
          className="tap-target w-14 rounded-xl border border-[var(--border)] bg-white px-2 py-2 text-center text-lg"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nouvelle catégorie..."
          className="tap-target min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
        <button onClick={handleCreate} disabled={pending} className="btn btn-primary tap-target">
          <Plus size={16} /> Ajouter
        </button>
      </div>
      {error && <p className="text-sm font-medium text-[var(--color-status-out)]">{error}</p>}

      <div className="grid gap-2 sm:grid-cols-2">
        {categories.map((c) => (
          <div key={c.id} className="card flex items-center justify-between gap-2 p-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-lg">{c.icon}</span>
              {editingId === c.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                  className="w-full rounded-lg border border-[var(--color-palm-500)] px-2 py-1 text-sm"
                />
              ) : (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--foreground)]/50">{c.productCount} produit(s)</p>
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-1">
              {editingId === c.id ? (
                <button onClick={() => saveEdit(c.id)} className="btn btn-icon btn-secondary tap-target">
                  <Check size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditValue(c.name);
                  }}
                  className="btn btn-icon btn-secondary tap-target"
                >
                  <Pencil size={14} />
                </button>
              )}
              <button onClick={() => handleDelete(c.id)} className="btn btn-icon btn-danger tap-target">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
