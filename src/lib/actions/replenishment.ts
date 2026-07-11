"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import type { ReplenishmentStatus, Urgency } from "@prisma/client";

function revalidateAll() {
  revalidatePath("/reappro");
  revalidatePath("/dashboard");
}

export async function updateReplenishmentStatusAction(
  itemId: string,
  status: ReplenishmentStatus
) {
  await requireSession();
  await prisma.replenishmentItem.update({ where: { id: itemId }, data: { status } });
  revalidateAll();
}

export async function bulkUpdateReplenishmentStatusAction(
  itemIds: string[],
  status: ReplenishmentStatus
) {
  await requireSession();
  await prisma.replenishmentItem.updateMany({
    where: { id: { in: itemIds } },
    data: { status },
  });

  if (status === "TRANSFERE" || status === "TERMINE") {
    const items = await prisma.replenishmentItem.findMany({
      where: { id: { in: itemIds } },
    });
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const newQty = product.quantity + item.recommendedQty;
      await prisma.$transaction([
        prisma.product.update({ where: { id: product.id }, data: { quantity: newQty } }),
        prisma.stockMovement.create({
          data: {
            productId: product.id,
            oldQty: product.quantity,
            newQty,
            delta: item.recommendedQty,
            type: "REAPPRO",
            comment: "Réapprovisionnement transféré au stand",
          },
        }),
      ]);
    }
    revalidatePath("/stock");
  }

  revalidateAll();
}

export async function updateReplenishmentItemAction(
  itemId: string,
  data: { recommendedQty?: number; urgency?: Urgency; comment?: string }
) {
  await requireSession();
  await prisma.replenishmentItem.update({ where: { id: itemId }, data });
  revalidateAll();
}

export async function removeReplenishmentItemAction(itemId: string) {
  await requireSession();
  await prisma.replenishmentItem.delete({ where: { id: itemId } });
  revalidateAll();
}
