"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function revalidateAll() {
  revalidatePath("/parametres");
  revalidatePath("/inventaire");
  revalidatePath("/dashboard");
  revalidatePath("/stock");
}

export async function reassignPosteResponsibleAction(posteId: string, userId: string | null) {
  await requireAdmin();
  await prisma.poste.update({ where: { id: posteId }, data: { responsibleId: userId } });
  revalidateAll();
}

export type PosteFormResult = { error?: string };

export async function createPosteAction(name: string): Promise<PosteFormResult> {
  await requireAdmin();
  if (!name.trim()) return { error: "Le nom du poste est obligatoire." };
  const existing = await prisma.poste.findUnique({ where: { name: name.trim() } });
  if (existing) return { error: "Ce poste existe déjà." };
  const count = await prisma.poste.count();
  await prisma.poste.create({ data: { name: name.trim(), order: count } });
  revalidateAll();
  return {};
}

export async function renamePosteAction(posteId: string, name: string): Promise<PosteFormResult> {
  await requireAdmin();
  if (!name.trim()) return { error: "Le nom du poste est obligatoire." };
  await prisma.poste.update({ where: { id: posteId }, data: { name: name.trim() } });
  revalidateAll();
  return {};
}
