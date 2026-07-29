import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardCheck, ClipboardList, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { todayDateOnly } from "@/lib/postes";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/inventaire");

  const date = todayDateOnly();

  const [postes, closedSessions, prepItems, serviceDay] = await Promise.all([
    prisma.poste.findMany({ orderBy: { order: "asc" }, include: { responsible: true } }),
    prisma.inventorySession.findMany({
      where: { date, finishedAt: { not: null } },
      distinct: ["posteId"],
    }),
    prisma.prepItem.findMany({ where: { date } }),
    prisma.serviceDay.findUnique({ where: { date } }),
  ]);

  const closedPosteIds = new Set(closedSessions.map((s) => s.posteId));
  const totalPostes = postes.length;
  const closedCount = closedPosteIds.size;
  const toBringCount = prepItems.length;
  const remainingToPrepCount = prepItems.filter((p) => !p.checked).length;

  const status: "Non commencé" | "En cours" | "Prêt" = serviceDay?.readyAt
    ? "Prêt"
    : closedCount === 0
      ? "Non commencé"
      : "En cours";

  const statusStyle = {
    "Non commencé": { bg: "var(--color-status-out-bg)", color: "var(--color-status-out)" },
    "En cours": { bg: "var(--color-status-low-bg)", color: "var(--color-status-low)" },
    Prêt: { bg: "var(--color-status-ok-bg)", color: "var(--color-status-ok)" },
  }[status];

  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Tableau de bord</h1>
          <p className="mt-1 capitalize text-sm text-[var(--foreground)]/60">
            Service du {dateLabel}
          </p>
        </div>
        <span
          className="status-pill shrink-0 !text-sm"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {status}
        </span>
      </div>

      <div className="card flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-status-low-bg)] text-[var(--color-status-low)]">
          <Clock size={20} />
        </div>
        <div>
          <p className="font-semibold">Heure limite : 16 h 00</p>
          <p className="text-xs text-[var(--foreground)]/60">
            Tout doit être prêt pour le service de 18 h.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Link href="/inventaire" className="card flex flex-col gap-2 p-4 transition-transform active:scale-[0.98] sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-palm-100)] text-[var(--color-palm-700)]">
            <ClipboardCheck size={20} />
          </div>
          <p className="text-3xl font-extrabold text-[var(--color-palm-900)]">
            {closedCount}/{totalPostes}
          </p>
          <p className="text-sm font-medium text-[var(--foreground)]/70">Inventaires terminés</p>
        </Link>

        <Link href="/preparation" className="card flex flex-col gap-2 p-4 transition-transform active:scale-[0.98] sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-status-planned-bg)] text-[var(--color-status-planned)]">
            <ClipboardList size={20} />
          </div>
          <p className="text-3xl font-extrabold text-[var(--color-palm-900)]">{toBringCount}</p>
          <p className="text-sm font-medium text-[var(--foreground)]/70">Produits à remettre</p>
        </Link>

        <Link href="/preparation" className="card flex flex-col gap-2 p-4 transition-transform active:scale-[0.98] sm:p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-status-low-bg)] text-[var(--color-status-low)]">
            <ClipboardList size={20} />
          </div>
          <p className="text-3xl font-extrabold text-[var(--color-palm-900)]">{remainingToPrepCount}</p>
          <p className="text-sm font-medium text-[var(--foreground)]/70">Restant à préparer</p>
        </Link>
      </div>

      <div className="space-y-2.5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">Postes</h2>
        {postes.map((poste) => {
          const closed = closedPosteIds.has(poste.id);
          return (
            <div key={poste.id} className="card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{poste.name}</p>
                <p className="text-xs text-[var(--foreground)]/60">
                  Responsable : {poste.responsible?.name ?? "Non assigné"}
                </p>
              </div>
              <span className={`status-pill ${closed ? "status-ok" : "status-low"}`}>
                {closed ? "Clôturé" : "En attente"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
