"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession, hashPin, canManageUsers } from "@/lib/auth";
import type { Role } from "@prisma/client";

export type UserActionResult = { error?: string };

export async function createUserAction(input: {
  name: string;
  email: string;
  pin: string;
  role: Role;
}): Promise<UserActionResult> {
  const session = await requireSession();
  if (!canManageUsers(session.role)) return { error: "Action réservée à l'administrateur." };

  const email = input.email.trim().toLowerCase();
  if (!input.name.trim() || !email || !input.pin.trim()) {
    return { error: "Tous les champs sont obligatoires." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Un utilisateur avec cet e-mail existe déjà." };

  await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      pinHash: await hashPin(input.pin.trim()),
      role: input.role,
    },
  });

  revalidatePath("/utilisateurs");
  return {};
}

export async function updateUserRoleAction(userId: string, role: Role) {
  const session = await requireSession();
  if (!canManageUsers(session.role)) return { error: "Action réservée à l'administrateur." };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/utilisateurs");
  return {};
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  const session = await requireSession();
  if (!canManageUsers(session.role)) return { error: "Action réservée à l'administrateur." };
  if (session.id === userId && !active) {
    return { error: "Vous ne pouvez pas désactiver votre propre compte." };
  }
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/utilisateurs");
  return {};
}

export async function resetUserPinAction(userId: string, pin: string): Promise<UserActionResult> {
  const session = await requireSession();
  if (!canManageUsers(session.role)) return { error: "Action réservée à l'administrateur." };
  if (!pin.trim()) return { error: "Merci d'indiquer un nouveau code." };
  await prisma.user.update({ where: { id: userId }, data: { pinHash: await hashPin(pin.trim()) } });
  revalidatePath("/utilisateurs");
  return {};
}
