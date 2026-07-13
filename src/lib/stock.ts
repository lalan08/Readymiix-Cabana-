import type { Unit } from "@prisma/client";

export const UNIT_LABEL: Record<Unit, string> = {
  BOUTEILLE: "bouteille(s)",
  SAC_5KG: "sac(s) de 5 kg",
  KILOGRAMME: "kg",
  LITRE: "litre(s)",
  PIECE: "pièce(s)",
  PAQUET: "paquet(s)",
  CARTON: "carton(s)",
  PORTION: "portion(s)",
  BOWL: "bowl(s)",
  CANETTE: "canette(s)",
};

/** Quantité cible − quantité restante, jamais négative. */
export function toBring(target: number, remaining: number) {
  const diff = target - remaining;
  return diff > 0 ? diff : 0;
}

export function formatQty(qty: number) {
  return Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\.?0+$/, "");
}
