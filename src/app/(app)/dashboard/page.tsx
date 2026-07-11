import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getStockStatus } from "@/lib/stock";
import { getNotifications } from "@/lib/notifications";
import { ensureReplenishmentSync } from "@/lib/replenishment-sync";
import { AlertTriangle, Info, TriangleAlert, Clock, Package, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureReplenishmentSync();

  const [products, lastMovement, replenishCount] = await Promise.all([
    prisma.product.findMany({ where: { archived: false } }),
    prisma.stockMovement.findFirst({ orderBy: { createdAt: "desc" } }),
    prisma.replenishmentItem.count({
      where: { status: { notIn: ["TERMINE"] } },
    }),
  ]);

  const counts = { SUFFISANT: 0, FAIBLE: 0, RUPTURE: 0 };
  for (const p of products) {
    counts[getStockStatus(p.quantity, p.minQuantity)]++;
  }

  const notifications = await getNotifications();

  const lastUpdateLabel = lastMovement
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(lastMovement.createdAt)
    : "Aucune mise à jour";

  const cards = [
    { label: "Stock suffisant", value: counts.SUFFISANT, color: "var(--color-status-ok)", bg: "var(--color-status-ok-bg)", emoji: "🟢", href: "/stock?statut=SUFFISANT" },
    { label: "Stock faible", value: counts.FAIBLE, color: "var(--color-status-low)", bg: "var(--color-status-low-bg)", emoji: "🟠", href: "/stock?statut=FAIBLE" },
    { label: "Rupture de stock", value: counts.RUPTURE, color: "var(--color-status-out)", bg: "var(--color-status-out-bg)", emoji: "🔴", href: "/stock?statut=RUPTURE" },
    { label: "À réapprovisionner", value: replenishCount, color: "var(--color-status-planned)", bg: "var(--color-status-planned-bg)", emoji: "🔵", href: "/reappro" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Tableau de bord</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--foreground)]/60">
          <Clock size={14} /> Dernière mise à jour : {lastUpdateLabel}
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.href ?? "#"}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
                n.level === "danger"
                  ? "border-[var(--color-status-out)]/30 bg-[var(--color-status-out-bg)] text-[var(--color-status-out)]"
                  : n.level === "warning"
                    ? "border-[var(--color-status-low)]/30 bg-[var(--color-status-low-bg)] text-[var(--color-status-low)]"
                    : "border-[var(--color-status-planned)]/30 bg-[var(--color-status-planned-bg)] text-[var(--color-status-planned)]"
              }`}
            >
              {n.level === "danger" ? (
                <AlertTriangle size={18} />
              ) : n.level === "warning" ? (
                <TriangleAlert size={18} />
              ) : (
                <Info size={18} />
              )}
              {n.message}
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="card flex flex-col gap-2 p-4 transition-transform active:scale-[0.98] sm:p-5"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ background: c.bg }}
            >
              {c.emoji}
            </div>
            <p className="text-3xl font-extrabold" style={{ color: c.color }}>
              {c.value}
            </p>
            <p className="text-sm font-medium text-[var(--foreground)]/70">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/stock" className="card flex items-center gap-4 p-5 transition-transform active:scale-[0.98]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-palm-100)] text-[var(--color-palm-700)]">
            <Package size={22} />
          </div>
          <div>
            <p className="font-semibold">Voir le stock complet</p>
            <p className="text-sm text-[var(--foreground)]/60">Consulter et mettre à jour les quantités</p>
          </div>
        </Link>
        <Link href="/reappro" className="card flex items-center gap-4 p-5 transition-transform active:scale-[0.98]">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-mango-400)]/25 text-[var(--color-coral-600)]">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="font-semibold">Liste de réapprovisionnement</p>
            <p className="text-sm text-[var(--foreground)]/60">Préparer, partager et imprimer la liste</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
