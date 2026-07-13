"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { todayDateOnly } from "@/lib/postes";

function revalidateAll() {
  revalidatePath("/preparation");
  revalidatePath("/dashboard");
  revalidatePath("/depot");
  revalidatePath("/stock");
}

export async function togglePrepItemAction(prepItemId: string) {
  const session = await requireAdmin();
  const item = await prisma.prepItem.findUniqueOrThrow({ where: { id: prepItemId } });
  const product = await prisma.product.findUniqueOrThrow({ where: { id: item.productId } });

  if (!item.checked) {
    // Coché : on prépare/charge le produit → on le retire du stock dépôt.
    await prisma.$transaction([
      prisma.prepItem.update({
        where: { id: prepItemId },
        data: {
          checked: true,
          checkedAt: new Date(),
          checkedById: session.id,
          depotDeducted: true,
        },
      }),
      prisma.product.update({
        where: { id: item.productId },
        data: { depotQuantity: Math.max(0, product.depotQuantity - item.quantityNeeded) },
      }),
    ]);
  } else {
    // Décoché : on annule, on restitue le stock dépôt si besoin.
    await prisma.$transaction([
      prisma.prepItem.update({
        where: { id: prepItemId },
        data: { checked: false, checkedAt: null, checkedById: null, depotDeducted: false },
      }),
      ...(item.depotDeducted
        ? [
            prisma.product.update({
              where: { id: item.productId },
              data: { depotQuantity: { increment: item.quantityNeeded } },
            }),
          ]
        : []),
    ]);
  }

  revalidateAll();
}

export async function markServiceReadyAction() {
  const session = await requireAdmin();
  const date = todayDateOnly();

  const unchecked = await prisma.prepItem.count({ where: { date, checked: false } });
  if (unchecked > 0) {
    throw new Error("Tous les produits ne sont pas encore préparés.");
  }

  await prisma.serviceDay.upsert({
    where: { date },
    update: { readyAt: new Date(), readyById: session.id },
    create: { date, readyAt: new Date(), readyById: session.id },
  });

  revalidateAll();
}

export async function unmarkServiceReadyAction() {
  await requireAdmin();
  const date = todayDateOnly();
  await prisma.serviceDay.upsert({
    where: { date },
    update: { readyAt: null, readyById: null },
    create: { date },
  });
  revalidateAll();
}
