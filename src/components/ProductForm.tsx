"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { createProductAction, updateProductAction, archiveProductAction } from "@/lib/actions/products";
import { UNIT_LABEL } from "@/lib/stock";
import type { Unit } from "@prisma/client";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

type Category = { id: string; name: string; icon: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  categoryId: string;
  quantity: number;
  unit: Unit;
  minQuantity: number;
  idealQuantity: number;
  location: string;
  supplier: string;
  purchasePrice: string;
  comment: string;
  photoUrl: string;
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const isEdit = Boolean(initial?.id);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") || "").trim();
    const categoryId = String(formData.get("categoryId") || "");
    const quantity = parseFloat(String(formData.get("quantity") || "0"));
    const unit = String(formData.get("unit") || "PIECE") as Unit;
    const minQuantity = parseFloat(String(formData.get("minQuantity") || "0"));
    const idealQuantity = parseFloat(String(formData.get("idealQuantity") || "0"));
    const location = String(formData.get("location") || "");
    const supplier = String(formData.get("supplier") || "");
    const priceRaw = String(formData.get("purchasePrice") || "");
    const comment = String(formData.get("comment") || "");

    if (!name || !categoryId) {
      setError("Le nom et la catégorie sont obligatoires.");
      return;
    }

    const input = {
      name,
      categoryId,
      quantity: Number.isNaN(quantity) ? 0 : quantity,
      unit,
      minQuantity: Number.isNaN(minQuantity) ? 0 : minQuantity,
      idealQuantity: Number.isNaN(idealQuantity) ? 0 : idealQuantity,
      location,
      supplier,
      purchasePrice: priceRaw ? parseFloat(priceRaw) : undefined,
      comment,
      photoUrl,
    };

    startTransition(async () => {
      if (isEdit && initial?.id) {
        await updateProductAction(initial.id, input);
        router.push("/stock");
      } else {
        await createProductAction(input);
        router.push("/stock");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="card space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-semibold">Photo (facultative)</label>
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[var(--border)]">
                <Image src={photoUrl} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-1 text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="tap-target flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[var(--border)] text-[var(--foreground)]/50">
                <ImagePlus size={20} />
                <span className="text-[10px]">Ajouter</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setPhotoUrl(await fileToDataUrl(file));
                  }}
                />
              </label>
            )}
          </div>
        </div>

        <Field label="Nom du produit" required>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            className="input"
            placeholder="Ex : Gobelets 700 ml"
          />
        </Field>

        <Field label="Catégorie" required>
          <select name="categoryId" required defaultValue={initial?.categoryId} className="input">
            <option value="" disabled>
              Choisir une catégorie
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantité disponible">
            <input
              name="quantity"
              type="number"
              step="any"
              defaultValue={initial?.quantity ?? 0}
              className="input"
            />
          </Field>
          <Field label="Unité">
            <select name="unit" defaultValue={initial?.unit ?? "PIECE"} className="input">
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {UNIT_LABEL[u]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantité minimale">
            <input
              name="minQuantity"
              type="number"
              step="any"
              defaultValue={initial?.minQuantity ?? 0}
              className="input"
            />
          </Field>
          <Field label="Quantité idéale">
            <input
              name="idealQuantity"
              type="number"
              step="any"
              defaultValue={initial?.idealQuantity ?? 0}
              className="input"
            />
          </Field>
        </div>

        <Field label="Emplacement">
          <input name="location" defaultValue={initial?.location} className="input" placeholder="Ex : Réserve A" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Fournisseur (facultatif)">
            <input name="supplier" defaultValue={initial?.supplier} className="input" />
          </Field>
          <Field label="Prix d'achat (facultatif)">
            <input
              name="purchasePrice"
              type="number"
              step="any"
              defaultValue={initial?.purchasePrice}
              className="input"
            />
          </Field>
        </div>

        <Field label="Commentaire">
          <textarea name="comment" defaultValue={initial?.comment} rows={2} className="input resize-none" />
        </Field>
      </div>

      {error && (
        <p className="rounded-xl bg-[var(--color-status-out-bg)] px-4 py-3 text-sm font-medium text-[var(--color-status-out)]">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary tap-target flex-1 disabled:opacity-60">
          {pending ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Ajouter le produit"}
        </button>
      </div>

      {isEdit && initial?.id && (
        <button
          type="button"
          onClick={() => {
            if (confirm("Supprimer ce produit ? Il sera archivé et n'apparaîtra plus dans le stock.")) {
              startTransition(async () => {
                await archiveProductAction(initial.id!);
                router.push("/stock");
              });
            }
          }}
          className="btn btn-danger tap-target w-full"
        >
          Supprimer le produit
        </button>
      )}

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
        .input:focus {
          border-color: var(--color-palm-500);
          box-shadow: 0 0 0 3px var(--color-palm-100);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold">
        {label} {required && <span className="text-[var(--color-coral-600)]">*</span>}
      </label>
      {children}
    </div>
  );
}
