import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { LossForm } from "@/components/LossForm";
import { LOSS_REASON_LABEL } from "@/lib/losses";
import { UNIT_LABEL, formatQty } from "@/lib/stock";

export const dynamic = "force-dynamic";

export default async function LossesPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const [products, losses] = await Promise.all([
    prisma.product.findMany({ where: { archived: false }, include: { poste: true }, orderBy: { name: "asc" } }),
    prisma.loss.findMany({
      include: { product: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Gestion des pertes</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Déclarer un produit cassé, renversé, périmé, offert ou perdu.
        </p>
      </div>

      <LossForm
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.quantity,
          unit: p.unit,
          posteName: p.poste.name,
        }))}
      />

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">
          Pertes récentes
        </h2>
        <div className="space-y-2.5">
          {losses.map((loss) => (
            <div key={loss.id} className="card flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{loss.product.name}</p>
                <p className="text-xs text-[var(--foreground)]/60">
                  {formatQty(loss.quantity)} {UNIT_LABEL[loss.product.unit]} · {LOSS_REASON_LABEL[loss.reason]}
                  {loss.user ? ` · ${loss.user.name}` : ""}
                </p>
                {loss.comment && <p className="mt-0.5 text-xs italic text-[var(--foreground)]/50">{loss.comment}</p>}
              </div>
              <p className="shrink-0 text-xs text-[var(--foreground)]/50">
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(loss.createdAt)}
              </p>
            </div>
          ))}
          {losses.length === 0 && (
            <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
              Aucune perte enregistrée pour le moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
