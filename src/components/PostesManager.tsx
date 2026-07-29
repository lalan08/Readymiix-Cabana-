"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Pencil } from "lucide-react";
import { createPosteAction, renamePosteAction, reassignPosteResponsibleAction } from "@/lib/actions/postes";

type Poste = { id: string; name: string; productCount: number; responsibleId: string | null };
type UserOption = { id: string; name: string };

export function PostesManager({ postes, users }: { postes: Poste[]; users: UserOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      const res = await createPosteAction(newName);
      if (res.error) {
        setError(res.error);
        return;
      }
      setNewName("");
      router.refresh();
    });
  }

  function saveEdit(id: string) {
    startTransition(async () => {
      await renamePosteAction(id, editValue);
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-2 p-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouveau poste..."
          className="tap-target min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        />
        <button onClick={handleCreate} disabled={pending} className="btn btn-primary tap-target">
          <Plus size={16} /> Ajouter
        </button>
      </div>
      {error && <p className="text-sm font-medium text-[var(--color-status-out)]">{error}</p>}

      <div className="space-y-2.5">
        {postes.map((p) => (
          <div key={p.id} className="card space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              {editingId === p.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)}
                  className="w-full rounded-lg border border-[var(--color-palm-500)] px-2 py-1 text-sm"
                />
              ) : (
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-[var(--foreground)]/50">{p.productCount} produit(s)</p>
                </div>
              )}
              {editingId === p.id ? (
                <button onClick={() => saveEdit(p.id)} className="btn btn-icon btn-secondary tap-target shrink-0">
                  <Check size={14} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setEditValue(p.name);
                  }}
                  className="btn btn-icon btn-secondary tap-target shrink-0"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--foreground)]/60">Responsable</label>
              <select
                value={p.responsibleId ?? ""}
                onChange={(e) =>
                  startTransition(async () => {
                    await reassignPosteResponsibleAction(p.id, e.target.value || null);
                    router.refresh();
                  })
                }
                className="tap-target w-full rounded-lg border border-[var(--border)] bg-white px-2 py-2 text-sm"
              >
                <option value="">Non assigné</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
