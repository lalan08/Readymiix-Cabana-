"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import type { LossReason } from "@prisma/client";

export type LossInput = {
  productId: string;
  quantity: number;
  reason: LossReason;
  comment?: string;
  photoUrl?: string;
};

export async function declareLossAction(input: LossInput) {
  const session = await requireSession();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: input.productId } });
  const quantity = Math.min(Math.max(0, input.quantity), product.quantity);
  const newQty = product.quantity - quantity;

  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: { quantity: newQty, updatedById: session.id },
    }),
    prisma.loss.create({
      data: {
        productId: product.id,
        quantity,
        reason: input.reason,
        comment: input.comment || null,
        photoUrl: input.photoUrl || null,
        userId: session.id,
      },
    }),
    prisma.stockMovement.create({
      data: {
        productId: product.id,
        oldQty: product.quantity,
        newQty,
        delta: -quantity,
        type: "PERTE",
        userId: session.id,
        comment: input.comment || `Perte : ${input.reason}`,
      },
    }),
  ]);

  revalidatePath("/pertes");
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  revalidatePath("/historique");
  revalidatePath("/preparation");
}
