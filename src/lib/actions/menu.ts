"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function revalidateAll() {
  revalidatePath("/caisse");
  revalidatePath("/caisse/produits");
}

export type MenuItemFormResult = { error?: string };

export type MenuItemInput = {
  name: string;
  category: string;
  price: number;
};

export async function createMenuItemAction(input: MenuItemInput): Promise<MenuItemFormResult> {
  await requireAdmin();
  if (!input.name.trim() || !input.category.trim()) {
    return { error: "Le nom et la catégorie sont obligatoires." };
  }
  if (Number.isNaN(input.price) || input.price < 0) {
    return { error: "Le prix doit être un nombre positif." };
  }
  const count = await prisma.menuItem.count();
  await prisma.menuItem.create({
    data: {
      name: input.name.trim(),
      category: input.category.trim(),
      price: input.price,
      order: count,
    },
  });
  revalidateAll();
  return {};
}

export async function updateMenuItemAction(
  id: string,
  input: MenuItemInput
): Promise<MenuItemFormResult> {
  await requireAdmin();
  if (!input.name.trim() || !input.category.trim()) {
    return { error: "Le nom et la catégorie sont obligatoires." };
  }
  if (Number.isNaN(input.price) || input.price < 0) {
    return { error: "Le prix doit être un nombre positif." };
  }
  await prisma.menuItem.update({
    where: { id },
    data: { name: input.name.trim(), category: input.category.trim(), price: input.price },
  });
  revalidateAll();
  return {};
}

export async function archiveMenuItemAction(id: string) {
  await requireAdmin();
  await prisma.menuItem.update({ where: { id }, data: { archived: true } });
  revalidateAll();
}
