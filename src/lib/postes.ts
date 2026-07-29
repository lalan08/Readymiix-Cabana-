import { prisma } from "@/lib/prisma";
import type { SessionUser } from "@/lib/auth";

/** Postes dont l'utilisateur est actuellement responsable (accès employé). */
export async function getPostesForUser(user: SessionUser) {
  if (user.role === "ADMIN") {
    return prisma.poste.findMany({ orderBy: { order: "asc" } });
  }
  return prisma.poste.findMany({
    where: { responsibleId: user.id },
    orderBy: { order: "asc" },
  });
}

/** Vérifie que l'utilisateur a le droit d'agir sur ce poste (admin ou responsable actuel). */
export async function assertPosteAccess(user: SessionUser, posteId: string) {
  if (user.role === "ADMIN") return;
  const poste = await prisma.poste.findUnique({ where: { id: posteId } });
  if (!poste || poste.responsibleId !== user.id) {
    throw new Error("FORBIDDEN");
  }
}

/** Date du jour, tronquée (utilisée comme clé pour la clôture/préparation du service). */
export function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
