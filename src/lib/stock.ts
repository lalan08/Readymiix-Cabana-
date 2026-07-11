import type { Unit } from "@prisma/client";

export type StockStatus = "SUFFISANT" | "FAIBLE" | "RUPTURE";

export function getStockStatus(quantity: number, minQuantity: number): StockStatus {
  if (quantity <= 0) return "RUPTURE";
  if (quantity <= minQuantity) return "FAIBLE";
  return "SUFFISANT";
}

export const STATUS_LABEL: Record<StockStatus, string> = {
  SUFFISANT: "Stock suffisant",
  FAIBLE: "Stock faible",
  RUPTURE: "Rupture de stock",
};

export const STATUS_COLOR: Record<StockStatus, string> = {
  SUFFISANT: "status-ok",
  FAIBLE: "status-low",
  RUPTURE: "status-out",
};

export const UNIT_LABEL: Record<Unit, string> = {
  BOUTEILLE: "bouteille(s)",
  PAQUET: "paquet(s)",
  KILOGRAMME: "kg",
  LITRE: "litre(s)",
  CARTON: "carton(s)",
  PIECE: "pièce(s)",
  SAC: "sac(s)",
  BOITE: "boîte(s)",
};

export function recommendedQty(quantity: number, minQuantity: number, idealQuantity: number) {
  const target = idealQuantity > 0 ? idealQuantity : minQuantity;
  const diff = target - quantity;
  return diff > 0 ? diff : 0;
}

export function formatQty(qty: number) {
  return Number.isInteger(qty) ? qty.toString() : qty.toFixed(2).replace(/\.?0+$/, "");
}
