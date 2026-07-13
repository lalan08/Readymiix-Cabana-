"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { Unit } from "@prisma/client";

function revalidateAll() {
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  revalidatePath("/preparation");
  revalidatePath("/historique");
  revalidatePath("/inventaire");
  revalidatePath("/depot");
}

export type ProductFormInput = {
  name: string;
  posteId: string;
  groupe?: string;
  quantity: number;
  unit: Unit;
  targetQuantity: number;
  depotQuantity: number;
  comment?: string;
  photoUrl?: string;
};

export async function createProductAction(input: ProductFormInput) {
  const session = await requireAdmin();
  const product = await prisma.product.create({
    data: {
      name: input.name,
      posteId: input.posteId,
      groupe: input.groupe || null,
      quantity: input.quantity,
      unit: input.unit,
      targetQuantity: input.targetQuantity,
      depotQuantity: input.depotQuantity,
      comment: input.comment || null,
      photoUrl: input.photoUrl || null,
      updatedById: session.id,
      movements: {
        create: {
          type: "CREATION",
          oldQty: 0,
          newQty: input.quantity,
          delta: input.quantity,
          userId: session.id,
          comment: "Création du produit",
        },
      },
    },
  });
  revalidateAll();
  return product.id;
}

export async function updateProductAction(productId: string, input: ProductFormInput) {
  const session = await requireAdmin();
  const previous = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      posteId: input.posteId,
      groupe: input.groupe || null,
      quantity: input.quantity,
      unit: input.unit,
      targetQuantity: input.targetQuantity,
      depotQuantity: input.depotQuantity,
      comment: input.comment || null,
      photoUrl: input.photoUrl || null,
      updatedById: session.id,
    },
  });

  if (previous.quantity !== input.quantity) {
    await prisma.stockMovement.create({
      data: {
        productId,
        oldQty: previous.quantity,
        newQty: input.quantity,
        delta: input.quantity - previous.quantity,
        type: "INVENTAIRE",
        userId: session.id,
        comment: "Correction manuelle (fiche produit)",
      },
    });
  }

  revalidateAll();
}

export async function archiveProductAction(productId: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { archived: true } });
  revalidateAll();
}
