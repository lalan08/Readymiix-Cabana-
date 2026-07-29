"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { declareLossAction } from "@/lib/actions/losses";
import { LOSS_REASON_LABEL } from "@/lib/losses";
import { UNIT_LABEL } from "@/lib/stock";
import { fileToCompressedDataUrl } from "@/lib/image";
import type { LossReason } from "@prisma/client";

type Product = { id: string; name: string; quantity: number; unit: keyof typeof UNIT_LABEL; posteName: string };

const REASONS = Object.keys(LOSS_REASON_LABEL) as LossReason[];

export function LossForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<LossReason>("CASSE");
  const [comment, setComment] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 30),
    [products, search]
  );

  const selected = products.find((p) => p.id === productId);

  function handleSubmit() {
    setError(null);
    const qty = parseFloat(quantity.replace(",", "."));
    if (!productId) {
      setError("Merci de sélectionner un produit.");
      return;
    }
    if (Number.isNaN(qty) || qty <= 0) {
      setError("Merci d'indiquer une quantité valide.");
      return;
    }
    startTransition(async () => {
      try {
        await declareLossAction({ productId, quantity: qty, reason, comment, photoUrl });
        router.refresh();
        setProductId("");
        setQuantity("1");
        setComment("");
        setPhotoUrl("");
        setSearch("");
      } catch {
        setError("Échec de l'enregistrement. Réessayez (photo peut-être trop lourde).");
      }
    });
  }

  return (
    <div className="card space-y-4 p-5">
      <div>
        <label className="mb-1 block text-sm font-semibold">Produit</label>
        <input
          value={selected ? selected.name : search}
          onChange={(e) => {
            setSearch(e.target.value);
            setProductId("");
          }}
          placeholder="Rechercher un produit..."
          className="input"
        />
        {!productId && search && (
          <div className="mt-1 max-h-48 overflow-y-auto rounded-xl border border-[var(--border)] bg-white">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProductId(p.id);
                  setSearch("");
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-[var(--color-sand-50)]"
              >
                <span>{p.name}</span>
                <span className="text-xs text-[var(--foreground)]/50">{p.posteName}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-[var(--foreground)]/50">Aucun résultat</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-semibold">Quantité perdue</label>
          <input
            inputMode="decimal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input"
          />
          {selected && (
            <p className="mt-1 text-xs text-[var(--foreground)]/50">
              Disponible : {selected.quantity} {UNIT_LABEL[selected.unit]}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Motif</label>
          <select value={reason} onChange={(e) => setReason(e.target.value as LossReason)} className="input">
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {LOSS_REASON_LABEL[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Commentaire (facultatif)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} className="input resize-none" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Photo (facultative)</label>
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

      {error && (
        <p className="rounded-xl bg-[var(--color-status-out-bg)] px-4 py-3 text-sm font-medium text-[var(--color-status-out)]">
          {error}
        </p>
      )}

      <button onClick={handleSubmit} disabled={pending} className="btn btn-danger tap-target w-full">
        {pending ? "Enregistrement..." : "Déclarer la perte"}
      </button>

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
    </div>
  );
}
