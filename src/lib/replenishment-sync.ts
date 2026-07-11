import { prisma } from "@/lib/prisma";
import { getStockStatus, recommendedQty } from "@/lib/stock";
import type { ReplenishmentStatus } from "@prisma/client";

const ACTIVE_STATUSES: ReplenishmentStatus[] = ["A_PREPARER", "A_ACHETER", "EN_COURS", "PRET"];

/**
 * Keeps the ReplenishmentItem for a single product consistent with its
 * current stock level: creates/updates an auto-tracked ("A_PREPARER")
 * entry while it's below minimum, and drops it once stock is sufficient
 * again (only if it was never moved forward in the preparation workflow).
 */
export async function syncProductReplenishment(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const status = getStockStatus(product.quantity, product.minQuantity);
  const existing = await prisma.replenishmentItem.findFirst({
    where: { productId, status: { in: ACTIVE_STATUSES } },
  });

  if (status === "SUFFISANT") {
    if (existing && existing.status === "A_PREPARER") {
      await prisma.replenishmentItem.delete({ where: { id: existing.id } });
    }
    return;
  }

  const urgency = status === "RUPTURE" ? "CRITIQUE" : "HAUTE";
  const recommended = recommendedQty(product.quantity, product.minQuantity, product.idealQuantity);

  if (existing) {
    if (existing.status === "A_PREPARER") {
      await prisma.replenishmentItem.update({
        where: { id: existing.id },
        data: { urgency, recommendedQty: recommended },
      });
    }
  } else {
    await prisma.replenishmentItem.create({
      data: { productId, urgency, recommendedQty: recommended, status: "A_PREPARER" },
    });
  }
}

/**
 * Runs the sync across every product. Called on dashboard/reappro page
 * loads so the list never drifts out of sync (e.g. after a seed or a
 * direct database edit that didn't go through a stock action).
 */
export async function ensureReplenishmentSync() {
  const products = await prisma.product.findMany({ where: { archived: false }, select: { id: true } });
  for (const product of products) {
    await syncProductReplenishment(product.id);
  }
}
