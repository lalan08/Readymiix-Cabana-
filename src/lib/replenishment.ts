import type { ReplenishmentStatus, Urgency } from "@prisma/client";

export const REPLENISHMENT_STATUS_LABEL: Record<ReplenishmentStatus, string> = {
  A_PREPARER: "À préparer",
  A_ACHETER: "À acheter",
  EN_COURS: "En cours",
  PRET: "Prêt",
  TRANSFERE: "Transféré au stand",
  TERMINE: "Terminé",
};

export const REPLENISHMENT_STATUS_ORDER: ReplenishmentStatus[] = [
  "A_PREPARER",
  "A_ACHETER",
  "EN_COURS",
  "PRET",
  "TRANSFERE",
  "TERMINE",
];

export const URGENCY_LABEL: Record<Urgency, string> = {
  BASSE: "Basse",
  NORMALE: "Normale",
  HAUTE: "Haute",
  CRITIQUE: "Critique",
};

export const URGENCY_COLOR: Record<Urgency, string> = {
  BASSE: "status-planned",
  NORMALE: "status-ok",
  HAUTE: "status-low",
  CRITIQUE: "status-out",
};
