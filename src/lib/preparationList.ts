import type { Unit } from "@prisma/client";
import { formatQty } from "@/lib/stock";

const UNIT_PREP: Record<Unit, { singular: string; plural: string }> = {
  BOUTEILLE: { singular: "bouteille", plural: "bouteilles" },
  SAC_5KG: { singular: "sac de 5 kg", plural: "sacs de 5 kg" },
  KILOGRAMME: { singular: "kg", plural: "kg" },
  LITRE: { singular: "litre", plural: "litres" },
  PIECE: { singular: "pièce", plural: "pièces" },
  PAQUET: { singular: "paquet", plural: "paquets" },
  CARTON: { singular: "carton", plural: "cartons" },
  PORTION: { singular: "portion", plural: "portions" },
  BOWL: { singular: "bowl", plural: "bowls" },
  CANETTE: { singular: "canette", plural: "canettes" },
};

export type PreparationItem = {
  productName: string;
  quantity: number;
  unit: Unit;
  posteName: string;
};

function itemLine(item: PreparationItem) {
  const unitLabel = item.quantity > 1 ? UNIT_PREP[item.unit].plural : UNIT_PREP[item.unit].singular;
  const name = item.productName.toLowerCase();
  const de = /^[aeiouhéèêàâîïôû]/.test(name) ? "d'" : "de ";
  return `- ${formatQty(item.quantity)} ${unitLabel} ${de}${name}`;
}

export function generatePreparationText(items: PreparationItem[], date = new Date()) {
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);

  const byPoste = new Map<string, PreparationItem[]>();
  for (const item of items) {
    if (!byPoste.has(item.posteName)) byPoste.set(item.posteName, []);
    byPoste.get(item.posteName)!.push(item);
  }

  const sections: string[] = [];
  for (const [posteName, posteItems] of byPoste) {
    sections.push(posteName);
    sections.push(...posteItems.map(itemLine));
    sections.push("");
  }

  return [`À préparer avant 16 h — ReadyMiix Cabana`, `(${dateLabel})`, "", ...sections].join("\n").trim();
}
