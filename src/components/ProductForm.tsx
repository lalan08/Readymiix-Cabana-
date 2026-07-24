"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { createProductAction, updateProductAction, archiveProductAction } from "@/lib/actions/products";
import { UNIT_LABEL } from "@/lib/stock";
import { fileToCompressedDataUrl } from "@/lib/image";
import type { Unit } from "@prisma/client";

const UNITS = Object.keys(UNIT_LABEL) as Unit[];

type Poste = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
  name: string;
  posteId: string;
  groupe: string;
  quantity: number;
  unit: Unit;
  targetQuantity: number;
  depotQuantity: number;
  comment: string;
  photoUrl: string;
};

export function ProductForm({
  postes,
  initial,
}: {
  postes: Poste[];
  initial?: ProductFormValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState(initial?.photoUrl ?? "");
  const [photoBusy, setPhotoBusy] = useState(false);
  const isEdit = Boolean(initial?.id);

  async function handlePhotoFile(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    try {
      setPhotoUrl(await fileToCompressedDataUrl(file));
    } catch {
      setError("Photo illisible, réessayez.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") || "").trim();
    const posteId = String(formData.get("posteId") || "");
    const groupe = String(formData.get("groupe") || "").trim();
    const quantity = parseFloat(String(formData.get("quantity") || "0"));
    const unit = String(formData.get("unit") || "PIECE") as Unit;
    const targetQuantity = parseFloat(String(formData.get("targetQuantity") || "0"));
    const depotQuantity = parseFloat(String(formData.get("depotQuantity") || "0"));
    const comment = String(formData.get("comment") || "");

    if (!name || !posteId) {
      setError("Le nom et le poste sont obligatoires.");
      return;
    }

    const input = {
      name,
      posteId,
      groupe,
      quantity: Number.isNaN(quantity) ? 0 : quantity,
      unit,
      targetQuantity: Number.isNaN(targetQuantity) ? 0 : targetQuantity,
      depotQuantity: Number.isNaN(depotQuantity) ? 0 : depotQuantity,
      comment,
      photoUrl,
    };

    startTransition(async () => {
      try {
        if (isEdit && initial?.id) {
          await updateProductAction(initial.id, input);
        } else {
          await createProductAction(input);
        }
        router.push("/stock");
      } catch {
        setError("Échec de l'enregistrement. Réessayez (photo peut-être trop lourde).");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="card space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-semibold">Photo (facultative)</label>
          <div className="flex items-center gap-3">
            <label className="tap-target relative flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed border-[var(--border)] text-[var(--foreground)]/50">
              {photoUrl ? (
                <>
                  <Image src={photoUrl} alt="" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setPhotoUrl("");
                    }}
                    className="absolute right-0.5 top-0.5 z-10 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : photoBusy ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <ImagePlus size={20} />
                  <span className="text-[10px]">Ajouter</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoFile(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <Field label="Nom du produit" required>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            className="input"
            placeholder="Ex : Sirop Fraise"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Poste" required>
            <select name="posteId" required defaultValue={initial?.posteId} className="input">
              <option value="" disabled>
                Choisir un poste
              </option>
              {postes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Groupe (facultatif)">
            <input
              name="groupe"
              defaultValue={initial?.groupe}
              className="input"
              placeholder="Ex : Sirops"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantité cible" required>
            <input
              name="targetQuantity"
              type="number"
              step="any"
              defaultValue={initial?.targetQuantity ?? 0}
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
          <Field label="Quantité restante actuelle">
            <input
              name="quantity"
              type="number"
              step="any"
              defaultValue={initial?.quantity ?? 0}
              className="input"
            />
          </Field>
          <Field label="Stock dépôt">
            <input
              name="depotQuantity"
              type="number"
              step="any"
              defaultValue={initial?.depotQuantity ?? 0}
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
