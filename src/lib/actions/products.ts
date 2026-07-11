"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { recommendedQty } from "@/lib/stock";
import { syncProductReplenishment as syncReplenishment } from "@/lib/replenishment-sync";
import type { MovementType, Unit } from "@prisma/client";

async function recordMovement(
  productId: string,
  oldQty: number,
  newQty: number,
  type: MovementType,
  userId: string,
  comment?: string
) {
  await prisma.stockMovement.create({
    data: {
      productId,
      oldQty,
      newQty,
      delta: newQty - oldQty,
      type,
      userId,
      comment,
    },
  });
}

function revalidateAll() {
  revalidatePath("/stock");
  revalidatePath("/dashboard");
  revalidatePath("/reappro");
  revalidatePath("/historique");
}

export async function adjustQuantityAction(
  productId: string,
  delta: number,
  comment?: string
) {
  const session = await requireSession();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const newQty = Math.max(0, product.quantity + delta);

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { quantity: newQty, updatedById: session.id },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        oldQty: product.quantity,
        newQty,
        delta: newQty - product.quantity,
        type: delta >= 0 ? "ENTREE" : "SORTIE",
        userId: session.id,
        comment,
      },
    }),
  ]);

  await syncReplenishment(productId);
  revalidateAll();
}

export async function setQuantityAction(
  productId: string,
  quantity: number,
  comment?: string
) {
  const session = await requireSession();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const newQty = Math.max(0, quantity);

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { quantity: newQty, updatedById: session.id },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        oldQty: product.quantity,
        newQty,
        delta: newQty - product.quantity,
        type: "INVENTAIRE",
        userId: session.id,
        comment,
      },
    }),
  ]);

  await syncReplenishment(productId);
  revalidateAll();
}

export async function reportRuptureAction(productId: string, comment?: string) {
  const session = await requireSession();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { quantity: 0, updatedById: session.id },
    }),
    prisma.stockMovement.create({
      data: {
        productId,
        oldQty: product.quantity,
        newQty: 0,
        delta: -product.quantity,
        type: "SORTIE",
        userId: session.id,
        comment: comment || "Rupture de stock signalée",
      },
    }),
  ]);

  await syncReplenishment(productId);
  revalidateAll();
}

export async function addToReplenishmentAction(productId: string) {
  await requireSession();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  const existing = await prisma.replenishmentItem.findFirst({
    where: { productId, status: { notIn: ["TERMINE", "TRANSFERE"] } },
  });
  if (existing) {
    revalidateAll();
    return;
  }
  const recommended = recommendedQty(product.quantity, product.minQuantity, product.idealQuantity) || product.idealQuantity || 1;
  await prisma.replenishmentItem.create({
    data: {
      productId,
      urgency: "NORMALE",
      recommendedQty: recommended,
      status: "A_PREPARER",
    },
  });
  revalidateAll();
}

export type ProductFormInput = {
  name: string;
  categoryId: string;
  quantity: number;
  unit: Unit;
  minQuantity: number;
  idealQuantity: number;
  location?: string;
  supplier?: string;
  purchasePrice?: number;
  comment?: string;
  photoUrl?: string;
};

export async function createProductAction(input: ProductFormInput) {
  const session = await requireSession();
  const product = await prisma.product.create({
    data: {
      name: input.name,
      categoryId: input.categoryId,
      quantity: input.quantity,
      unit: input.unit,
      minQuantity: input.minQuantity,
      idealQuantity: input.idealQuantity,
      location: input.location || null,
      supplier: input.supplier || null,
      purchasePrice: input.purchasePrice ?? null,
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
  await syncReplenishment(product.id);
  revalidateAll();
  return product.id;
}

export async function updateProductAction(productId: string, input: ProductFormInput) {
  const session = await requireSession();
  const previous = await prisma.product.findUniqueOrThrow({ where: { id: productId } });

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: input.name,
      categoryId: input.categoryId,
      quantity: input.quantity,
      unit: input.unit,
      minQuantity: input.minQuantity,
      idealQuantity: input.idealQuantity,
      location: input.location || null,
      supplier: input.supplier || null,
      purchasePrice: input.purchasePrice ?? null,
      comment: input.comment || null,
      photoUrl: input.photoUrl || null,
      updatedById: session.id,
    },
  });

  if (previous.quantity !== input.quantity) {
    await recordMovement(
      productId,
      previous.quantity,
      input.quantity,
      "INVENTAIRE",
      session.id,
      "Modification de la fiche produit"
    );
  }

  await syncReplenishment(productId);
  revalidateAll();
}

export async function archiveProductAction(productId: string) {
  await requireSession();
  await prisma.product.update({ where: { id: productId }, data: { archived: true } });
  revalidateAll();
}
