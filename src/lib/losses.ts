import type { LossReason } from "@prisma/client";

export const LOSS_REASON_LABEL: Record<LossReason, string> = {
  CASSE: "Produit cassé",
  RENVERSE: "Produit renversé",
  PERIME: "Produit périmé",
  OFFERT: "Produit offert",
  ERREUR_PREPARATION: "Erreur de préparation",
  AUTRE: "Autre perte",
};
