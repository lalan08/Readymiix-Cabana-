"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { assertPosteAccess, todayDateOnly } from "@/lib/postes";
import { toBring } from "@/lib/stock";

export type InventoryLineInput = { productId: string; countedQty: number };

function revalidateAll() {
  revalidatePath("/inventaire");
  revalidatePath("/dashboard");
  revalidatePath("/preparation");
  revalidatePath("/stock");
  revalidatePath("/historique");
}

/** Recalcule (ou retire) la ligne de préparation du jour pour un produit,
 * en restaurant le stock dépôt si une déduction avait déjà eu lieu. */
async function syncPrepItem(date: Date, productId: string, posteId: string, quantityNeeded: number) {
  const existing = await prisma.prepItem.findUnique({
    where: { date_productId: { date, productId } },
  });

  if (existing?.depotDeducted) {
    await prisma.product.update({
      where: { id: productId },
      data: { depotQuantity: { increment: existing.quantityNeeded } },
    });
  }

  if (quantityNeeded <= 0) {
    if (existing) {
      await prisma.prepItem.delete({ where: { id: existing.id } });
    }
    return;
  }

  await prisma.prepItem.upsert({
    where: { date_productId: { date, productId } },
    update: { quantityNeeded, checked: false, checkedAt: null, checkedById: null, depotDeducted: false },
    create: { date, productId, posteId, quantityNeeded },
  });
}

export async function submitPosteInventoryAction(posteId: string, lines: InventoryLineInput[]) {
  const session = await requireSession();
  await assertPosteAccess(session, posteId);

  const date = todayDateOnly();

  const inventorySession = await prisma.inventorySession.create({
    data: { posteId, date, userId: session.id, finishedAt: new Date() },
  });

  for (const line of lines) {
    const product = await prisma.product.findUnique({ where: { id: line.productId } });
    if (!product || product.posteId !== posteId) continue;
    const counted = Math.max(0, line.countedQty);

    await prisma.inventoryLine.create({
      data: {
        sessionId: inventorySession.id,
        productId: product.id,
        previousQty: product.quantity,
        countedQty: counted,
      },
    });

    if (counted !== product.quantity) {
      await prisma.$transaction([
        prisma.product.update({
          where: { id: product.id },
          data: { quantity: counted, updatedById: session.id },
        }),
        prisma.stockMovement.create({
          data: {
            productId: product.id,
            oldQty: product.quantity,
            newQty: counted,
            delta: counted - product.quantity,
            type: "INVENTAIRE",
            userId: session.id,
            comment: `Clôture du poste — quantité restante`,
          },
        }),
      ]);
    }

    await syncPrepItem(date, product.id, posteId, toBring(product.targetQuantity, counted));
  }

  revalidateAll();
  return inventorySession.id;
}
