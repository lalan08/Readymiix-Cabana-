"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, requireAdmin } from "@/lib/auth";
import type { PaymentMethod } from "@prisma/client";

export type SaleItemInput = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

export type SaleInput = {
  items: SaleItemInput[];
  paymentMethod: PaymentMethod;
};

export type SaleFormResult = { error?: string };

export async function recordSaleAction(input: SaleInput): Promise<SaleFormResult> {
  const session = await requireSession();

  if (!input.items.length) {
    return { error: "Le ticket est vide." };
  }
  if (input.items.some((i) => i.quantity <= 0 || i.price < 0)) {
    return { error: "Ticket invalide." };
  }

  const total = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  await prisma.sale.create({
    data: {
      userId: session.id,
      userName: session.name,
      total,
      paymentMethod: input.paymentMethod,
      items: {
        create: input.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          lineTotal: i.price * i.quantity,
        })),
      },
    },
  });

  revalidatePath("/ventes");
  revalidatePath("/dashboard");

  return {};
}

export async function deleteSaleAction(id: string) {
  await requireAdmin();
  await prisma.sale.delete({ where: { id } });

  revalidatePath("/ventes");
  revalidatePath("/dashboard");
}
