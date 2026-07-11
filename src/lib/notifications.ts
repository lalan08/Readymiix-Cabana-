import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";

export type AppNotification = {
  id: string;
  level: "warning" | "danger" | "info";
  message: string;
  href?: string;
};

export async function getNotifications(): Promise<AppNotification[]> {
  const notifications: AppNotification[] = [];

  const products = await prisma.product.findMany({ where: { archived: false } });
  const outOfStock = products.filter((p) => getStockStatus(p.quantity, p.minQuantity) === "RUPTURE");
  const lowStock = products.filter((p) => getStockStatus(p.quantity, p.minQuantity) === "FAIBLE");

  if (outOfStock.length > 0) {
    notifications.push({
      id: "rupture",
      level: "danger",
      message: `${outOfStock.length} produit(s) en rupture de stock`,
      href: "/stock?statut=RUPTURE",
    });
  }
  if (lowStock.length > 0) {
    notifications.push({
      id: "faible",
      level: "warning",
      message: `${lowStock.length} produit(s) en stock faible`,
      href: "/stock?statut=FAIBLE",
    });
  }

  const readyItems = await prisma.replenishmentItem.count({ where: { status: "PRET" } });
  if (readyItems > 0) {
    notifications.push({
      id: "reappro-pret",
      level: "info",
      message: `${readyItems} produit(s) prêts pour le réapprovisionnement`,
      href: "/reappro",
    });
  }

  const urgentNotPrepared = await prisma.replenishmentItem.count({
    where: { urgency: "CRITIQUE", status: { in: ["A_PREPARER", "A_ACHETER"] } },
  });
  if (urgentNotPrepared > 0) {
    notifications.push({
      id: "urgent",
      level: "danger",
      message: `${urgentNotPrepared} produit(s) urgent(s) toujours pas préparé(s)`,
      href: "/reappro",
    });
  }

  const lastInventory = await prisma.inventorySession.findFirst({
    where: { finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!lastInventory || (lastInventory.finishedAt && lastInventory.finishedAt < today)) {
    notifications.push({
      id: "inventaire",
      level: "warning",
      message: "Aucun inventaire de fermeture n'a été réalisé aujourd'hui",
      href: "/inventaire",
    });
  }

  return notifications;
}
