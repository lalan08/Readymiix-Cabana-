"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Check, X, ImagePlus, Loader2 } from "lucide-react";
import { createMenuItemAction, updateMenuItemAction, archiveMenuItemAction } from "@/lib/actions/menu";
import { formatPrice } from "@/lib/menu";
import { fileToCompressedDataUrl } from "@/lib/image";

type MenuItem = { id: string; name: string; category: string; price: number; photoUrl: string | null };

function PhotoPicker({
  photoUrl,
  onChange,
}: {
  photoUrl: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setPhotoError(null);
    setBusy(true);
    try {
      onChange(await fileToCompressedDataUrl(file));
    } catch {
      setPhotoError("Photo illisible, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shrink-0">
      <label className="tap-target relative flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-xl border border-dashed border-[var(--border)] text-[var(--foreground)]/50">
        {photoUrl ? (
          <>
            <Image src={photoUrl} alt="" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onChange("");
              }}
              className="absolute right-0.5 top-0.5 z-10 rounded-full bg-black/60 p-1 text-white"
            >
              <X size={11} />
            </button>
          </>
        ) : busy ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <>
            <ImagePlus size={17} />
            <span className="text-[9px]">Photo</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
      {photoError && <p className="mt-1 w-16 text-[9px] leading-tight text-[var(--color-status-out)]">{photoError}</p>}
    </div>
  );
}

export function MenuItemsManager({ items }: { items: MenuItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", price: "", photoUrl: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", price: "", photoUrl: "" });

  const grouped = new Map<string, MenuItem[]>();
  for (const item of items) {
    if (!grouped.has(item.category)) grouped.set(item.category, []);
    grouped.get(item.category)!.push(item);
  }

  function submitNew() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await createMenuItemAction({
          name: form.name,
          category: form.category,
          price: parseFloat(form.price.replace(",", ".")),
          photoUrl: form.photoUrl,
        });
        if (res.error) {
          setError(res.error);
          return;
        }
        setForm({ name: "", category: "", price: "", photoUrl: "" });
        setShowForm(false);
        router.refresh();
      } catch {
        setError("Échec de l'enregistrement. Réessayez (photo peut-être trop lourde).");
      }
    });
  }

  function startEdit(item: MenuItem) {
    setError(null);
    setEditingId(item.id);
    setEditForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      photoUrl: item.photoUrl ?? "",
    });
  }

  function submitEdit(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateMenuItemAction(id, {
          name: editForm.name,
          category: editForm.category,
          price: parseFloat(editForm.price.replace(",", ".")),
          photoUrl: editForm.photoUrl,
        });
        if (res.error) {
          setError(res.error);
          return;
        }
        setEditingId(null);
        router.refresh();
      } catch {
        setError("Échec de l'enregistrement. Réessayez (photo peut-être trop lourde).");
      }
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
          <div className="flex gap-3">
            <PhotoPicker photoUrl={form.photoUrl} onChange={(url) => setForm((f) => ({ ...f, photoUrl: url }))} />
            <div className="flex-1 space-y-3">
              <input
                placeholder="Nom (ex : Caïpi Fraise 500 ml)"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input"
              />
              <input
                placeholder="Catégorie (ex : Frozen Caïpi)"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input"
              />
            </div>
          </div>
          <input
            placeholder="Prix (€)"
            inputMode="decimal"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="input"
          />
          {error && <p className="text-sm font-medium text-[var(--color-status-out)]">{error}</p>}
          <button onClick={submitNew} disabled={pending} className="btn btn-primary tap-target w-full disabled:opacity-60">
            {pending ? "Enregistrement..." : "Ajouter"}
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
                  <div className="flex gap-3">
                    <PhotoPicker
                      photoUrl={editForm.photoUrl}
                      onChange={(url) => setEditForm((f) => ({ ...f, photoUrl: url }))}
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="input"
                      />
                      <input
                        value={editForm.category}
                        onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <input
                    inputMode="decimal"
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    className="input"
                  />
                  {error && <p className="text-sm font-medium text-[var(--color-status-out)]">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitEdit(item.id)}
                      disabled={pending}
                      className="btn btn-primary tap-target flex-1 text-sm disabled:opacity-60"
                    >
                      <Check size={14} /> {pending ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary tap-target text-sm">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    {item.photoUrl ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                        <Image src={item.photoUrl} alt="" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <div className="h-11 w-11 shrink-0 rounded-lg bg-[var(--color-sand-100)]" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-[var(--foreground)]/50">{formatPrice(item.price)}</p>
                    </div>
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
