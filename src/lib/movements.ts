import type { MovementType } from "@prisma/client";

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  ENTREE: "Entrée de stock",
  SORTIE: "Sortie de stock",
  PERTE: "Perte / casse",
  INVENTAIRE: "Inventaire",
  CREATION: "Création produit",
};

export const MOVEMENT_TYPE_COLOR: Record<MovementType, string> = {
  ENTREE: "status-ok",
  SORTIE: "status-low",
  PERTE: "status-out",
  INVENTAIRE: "status-planned",
  CREATION: "status-ok",
};
