"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { syncProductReplenishment } from "@/lib/replenishment-sync";

export type InventoryLineInput = { productId: string; countedQty: number };

export async function submitClosingInventoryAction(lines: InventoryLineInput[], notes?: string) {
  const session = await requireSession();

  const session_ = await prisma.inventorySession.create({
    data: {
      userId: session.id,
      notes: notes || null,
      finishedAt: new Date(),
    },
  });

  for (const line of lines) {
    const product = await prisma.product.findUnique({ where: { id: line.productId } });
    if (!product) continue;
    const counted = Math.max(0, line.countedQty);

    await prisma.inventoryLine.create({
      data: {
        sessionId: session_.id,
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
            comment: "Inventaire de fermeture",
          },
        }),
      ]);
    }

    await syncProductReplenishment(product.id);
  }

  revalidatePath("/stock");
  revalidatePath("/dashboard");
  revalidatePath("/reappro");
  revalidatePath("/historique");
  revalidatePath("/inventaire");

  return session_.id;
}
