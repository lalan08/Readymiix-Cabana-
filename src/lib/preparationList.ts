import type { Unit } from "@prisma/client";
import { formatQty } from "@/lib/stock";

const UNIT_PREP: Record<Unit, { singular: string; plural: string }> = {
  BOUTEILLE: { singular: "bouteille", plural: "bouteilles" },
  PAQUET: { singular: "paquet", plural: "paquets" },
  KILOGRAMME: { singular: "kg", plural: "kg" },
  LITRE: { singular: "litre", plural: "litres" },
  CARTON: { singular: "carton", plural: "cartons" },
  PIECE: { singular: "pièce", plural: "pièces" },
  SAC: { singular: "sac", plural: "sacs" },
  BOITE: { singular: "boîte", plural: "boîtes" },
};

export type PreparationItem = {
  productName: string;
  quantity: number;
  unit: Unit;
};

export function generatePreparationText(items: PreparationItem[], date = new Date()) {
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
  }).format(date);

  const lines = items.map((item) => {
    const unitLabel = item.quantity > 1 ? UNIT_PREP[item.unit].plural : UNIT_PREP[item.unit].singular;
    const name = item.productName.toLowerCase();
    const de = /^[aeiouhéèêàâîïôû]/.test(name) ? "d'" : "de ";
    return `- ${formatQty(item.quantity)} ${unitLabel} ${de}${name}`;
  });

  return [`Réapprovisionnement ReadyMiix Cabana`, `(${dateLabel})`, "", ...lines].join("\n");
}
