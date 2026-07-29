import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPostesForUser, todayDateOnly } from "@/lib/postes";
import { PosteInventory } from "@/components/PosteInventory";

export const dynamic = "force-dynamic";

export default async function InventairePage({
  searchParams,
}: {
  searchParams: Promise<{ poste?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { poste: posteIdParam } = await searchParams;
  const postes = await getPostesForUser(session);

  if (postes.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
        Aucun poste ne vous est actuellement assigné. Contactez un administrateur.
      </div>
    );
  }

  const selectedPoste =
    postes.find((p) => p.id === posteIdParam) ?? postes[0];

  const date = todayDateOnly();
  const [products, closedSessions] = await Promise.all([
    prisma.product.findMany({
      where: { posteId: selectedPoste.id, archived: false },
      orderBy: [{ groupe: "asc" }, { name: "asc" }],
    }),
    prisma.inventorySession.findMany({
      where: { date, finishedAt: { not: null } },
      distinct: ["posteId"],
      select: { posteId: true },
    }),
  ]);

  const closedPosteIds = new Set(closedSessions.map((s) => s.posteId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Inventaire de fermeture</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Indiquez la quantité restante pour chaque produit du poste.
        </p>
      </div>

      {postes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {postes.map((p) => (
            <Link
              key={p.id}
              href={`/inventaire?poste=${p.id}`}
              className={`tap-target flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                p.id === selectedPoste.id
                  ? "bg-[var(--color-palm-600)] text-white"
                  : "bg-[var(--color-sand-100)] text-[var(--foreground)]/70"
              }`}
            >
              {p.name}
              {closedPosteIds.has(p.id) && <span aria-hidden>✅</span>}
            </Link>
          ))}
        </div>
      )}

      <PosteInventory
        posteId={selectedPoste.id}
        posteName={selectedPoste.name}
        alreadyClosedToday={closedPosteIds.has(selectedPoste.id)}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          targetQuantity: p.targetQuantity,
          groupe: p.groupe,
        }))}
      />
    </div>
  );
}
