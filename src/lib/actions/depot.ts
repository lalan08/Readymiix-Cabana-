"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function setDepotQuantityAction(productId: string, quantity: number) {
  await requireAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { depotQuantity: Math.max(0, quantity) },
  });
  revalidatePath("/depot");
  revalidatePath("/preparation");
  revalidatePath("/stock");
}

export async function adjustDepotQuantityAction(productId: string, delta: number) {
  await requireAdmin();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  await prisma.product.update({
    where: { id: productId },
    data: { depotQuantity: Math.max(0, product.depotQuantity + delta) },
  });
  revalidatePath("/depot");
  revalidatePath("/preparation");
  revalidatePath("/stock");
}
