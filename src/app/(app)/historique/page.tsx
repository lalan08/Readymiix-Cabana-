import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { HistoryFilters } from "@/components/HistoryFilters";
import { MOVEMENT_TYPE_LABEL, MOVEMENT_TYPE_COLOR } from "@/lib/movements";
import { UNIT_LABEL, formatQty } from "@/lib/stock";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; poste?: string; personne?: string; du?: string; au?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { q, poste, personne, du, au } = await searchParams;

  const where: Prisma.StockMovementWhereInput = {};
  if (q) where.product = { name: { contains: q } };
  if (poste) where.product = { ...(where.product as object), posteId: poste };
  if (personne) where.userId = personne;
  if (du || au) {
    where.createdAt = {
      ...(du ? { gte: new Date(`${du}T00:00:00`) } : {}),
      ...(au ? { lte: new Date(`${au}T23:59:59`) } : {}),
    };
  }

  const [movements, postes, users] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      include: { product: { include: { poste: true } }, user: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.poste.findMany({ orderBy: { order: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Historique</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Entrées, sorties, pertes et clôtures d&apos;inventaire.
        </p>
      </div>

      <HistoryFilters postes={postes} users={users.map((u) => ({ id: u.id, name: u.name }))} />

      <p className="text-sm text-[var(--foreground)]/60">{movements.length} mouvement(s)</p>

      <div className="space-y-2.5">
        {movements.map((m) => (
          <div key={m.id} className="card flex items-start justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`status-pill ${MOVEMENT_TYPE_COLOR[m.type]}`}>{MOVEMENT_TYPE_LABEL[m.type]}</span>
                <p className="truncate font-semibold">{m.product.name}</p>
              </div>
              <p className="mt-1 text-xs text-[var(--foreground)]/60">
                {formatQty(m.oldQty)} → {formatQty(m.newQty)} {UNIT_LABEL[m.product.unit]}{" "}
                <span className={m.delta >= 0 ? "text-[var(--color-status-ok)]" : "text-[var(--color-status-out)]"}>
                  ({m.delta >= 0 ? "+" : ""}
                  {formatQty(m.delta)})
                </span>
                {m.user ? ` · ${m.user.name}` : ""} · {m.product.poste.name}
              </p>
              {m.comment && <p className="mt-0.5 text-xs italic text-[var(--foreground)]/50">{m.comment}</p>}
            </div>
            <p className="shrink-0 text-xs text-[var(--foreground)]/50">
              {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(m.createdAt)}
            </p>
          </div>
        ))}
        {movements.length === 0 && (
          <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
            Aucun mouvement ne correspond à ces filtres.
          </div>
        )}
      </div>
    </div>
  );
}
