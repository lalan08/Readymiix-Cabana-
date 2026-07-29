"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteSaleAction } from "@/lib/actions/sales";

export function DeleteSaleButton({ saleId }: { saleId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Supprimer cette vente ? Elle sera retirée de l'historique et des statistiques.")) return;
    startTransition(async () => {
      await deleteSaleAction(saleId);
      router.push("/ventes");
    });
  }

  return (
    <button onClick={handleDelete} disabled={pending} className="btn btn-danger tap-target w-full disabled:opacity-60">
      <Trash2 size={16} /> {pending ? "Suppression..." : "Supprimer cette vente"}
    </button>
  );
}
