import Link from "next/link";
import { redirect } from "next/navigation";
import { Receipt, Euro, Banknote, CreditCard, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { todayDateOnly } from "@/lib/postes";
import { formatPrice } from "@/lib/menu";
import { PAYMENT_METHOD_LABEL } from "@/lib/sales";
import { VentesFilters } from "@/components/VentesFilters";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function VentesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; date?: string; personne?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { q, date, personne } = await searchParams;

  const todayStart = todayDateOnly();
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const dayStart = date ? new Date(`${date}T00:00:00.000Z`) : todayStart;
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const where: Prisma.SaleWhereInput = { createdAt: { gte: dayStart, lt: dayEnd } };
  if (personne) where.userId = personne;
  if (q) {
    where.OR = [
      { userName: { contains: q, mode: "insensitive" } },
      { items: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const [todaysSales, sales, users, topProductsRaw] = await Promise.all([
    prisma.sale.findMany({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.sale.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.saleItem.groupBy({
      by: ["name"],
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  const todayRevenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
  const todayCount = todaysSales.length;
  const todayCash = todaysSales.filter((s) => s.paymentMethod === "ESPECES").reduce((sum, s) => sum + s.total, 0);
  const todayCard = todaysSales.filter((s) => s.paymentMethod === "CARTE").reduce((sum, s) => sum + s.total, 0);

  const byUser = new Map<string, { revenue: number; count: number }>();
  for (const sale of todaysSales) {
    const entry = byUser.get(sale.userName) ?? { revenue: 0, count: 0 };
    entry.revenue += sale.total;
    entry.count += 1;
    byUser.set(sale.userName, entry);
  }
  const userStats = [...byUser.entries()].sort((a, b) => b[1].revenue - a[1].revenue);

  const isToday = dayStart.getTime() === todayStart.getTime();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Ventes</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">Historique et statistiques de la caisse.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card flex flex-col gap-2 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-palm-100)] text-[var(--color-palm-700)]">
            <Euro size={18} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--color-palm-900)]">{formatPrice(todayRevenue)}</p>
          <p className="text-xs font-medium text-[var(--foreground)]/70">CA du jour</p>
        </div>
        <div className="card flex flex-col gap-2 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-status-planned-bg)] text-[var(--color-status-planned)]">
            <Receipt size={18} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--color-palm-900)]">{todayCount}</p>
          <p className="text-xs font-medium text-[var(--foreground)]/70">Ventes du jour</p>
        </div>
        <div className="card flex flex-col gap-2 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-status-ok-bg)] text-[var(--color-status-ok)]">
            <Banknote size={18} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--color-palm-900)]">{formatPrice(todayCash)}</p>
          <p className="text-xs font-medium text-[var(--foreground)]/70">Espèces</p>
        </div>
        <div className="card flex flex-col gap-2 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-status-low-bg)] text-[var(--color-status-low)]">
            <CreditCard size={18} />
          </div>
          <p className="text-2xl font-extrabold text-[var(--color-palm-900)]">{formatPrice(todayCard)}</p>
          <p className="text-xs font-medium text-[var(--foreground)]/70">Carte</p>
        </div>
      </div>

      {userStats.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
            Aujourd&apos;hui par personne
          </h2>
          <div className="card divide-y divide-[var(--border)] p-0">
            {userStats.map(([name, stat]) => (
              <div key={name} className="flex items-center justify-between gap-3 p-4">
                <p className="font-semibold">{name}</p>
                <div className="text-right">
                  <p className="font-bold text-[var(--color-palm-900)]">{formatPrice(stat.revenue)}</p>
                  <p className="text-xs text-[var(--foreground)]/60">{stat.count} vente(s)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topProductsRaw.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--foreground)]/50" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
              Articles les plus vendus
            </h2>
          </div>
          <div className="card divide-y divide-[var(--border)] p-0">
            {topProductsRaw.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-3 p-4">
                <p className="min-w-0 truncate font-semibold">{p.name}</p>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-[var(--color-palm-900)]">{p._sum.quantity ?? 0} vendu(s)</p>
                  <p className="text-xs text-[var(--foreground)]/60">{formatPrice(p._sum.lineTotal ?? 0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
          {isToday ? "Ventes du jour" : "Ventes"}
        </h2>
        <VentesFilters users={users.map((u) => ({ id: u.id, name: u.name }))} />

        <p className="text-sm text-[var(--foreground)]/60">{sales.length} vente(s)</p>

        <div className="space-y-2.5">
          {sales.map((sale) => (
            <Link
              key={sale.id}
              href={`/ventes/${sale.id}`}
              className="card flex items-center justify-between gap-3 p-4 transition-transform active:scale-[0.98]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`status-pill ${sale.paymentMethod === "ESPECES" ? "status-ok" : "status-planned"}`}
                  >
                    {PAYMENT_METHOD_LABEL[sale.paymentMethod]}
                  </span>
                  <p className="truncate text-sm font-semibold">{sale.userName}</p>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--foreground)]/60">
                  {sale.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-bold text-[var(--color-palm-900)]">{formatPrice(sale.total)}</p>
                <p className="text-xs text-[var(--foreground)]/50">
                  {new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" }).format(sale.createdAt)}
                </p>
              </div>
            </Link>
          ))}
          {sales.length === 0 && (
            <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
              Aucune vente ne correspond à ces filtres.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
