"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, canManageCategories } from "@/lib/auth";

export type CategoryActionResult = { error?: string };

export async function createCategoryAction(name: string, icon: string): Promise<CategoryActionResult> {
  const session = await requireSession();
  if (!canManageCategories(session.role)) return { error: "Action non autorisée." };
  if (!name.trim()) return { error: "Le nom de la catégorie est obligatoire." };

  const existing = await prisma.category.findUnique({ where: { name: name.trim() } });
  if (existing) return { error: "Cette catégorie existe déjà." };

  const count = await prisma.category.count();
  await prisma.category.create({ data: { name: name.trim(), icon: icon || "📦", order: count } });
  revalidatePath("/parametres");
  revalidatePath("/stock");
  return {};
}

export async function updateCategoryAction(
  id: string,
  data: { name?: string; icon?: string }
): Promise<CategoryActionResult> {
  const session = await requireSession();
  if (!canManageCategories(session.role)) return { error: "Action non autorisée." };
  await prisma.category.update({ where: { id }, data });
  revalidatePath("/parametres");
  revalidatePath("/stock");
  return {};
}

export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const session = await requireSession();
  if (!canManageCategories(session.role)) return { error: "Action non autorisée." };

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return { error: "Impossible de supprimer une catégorie contenant des produits." };
  }
  await prisma.category.delete({ where: { id } });
  revalidatePath("/parametres");
  revalidatePath("/stock");
  return {};
}
