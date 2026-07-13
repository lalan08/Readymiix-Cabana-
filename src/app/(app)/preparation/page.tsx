import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { todayDateOnly } from "@/lib/postes";
import { PrepChecklist } from "@/components/PrepChecklist";

export const dynamic = "force-dynamic";

export default async function PreparationPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/inventaire");

  const date = todayDateOnly();

  const [items, serviceDay] = await Promise.all([
    prisma.prepItem.findMany({
      where: { date },
      include: { product: true, poste: true },
      orderBy: [{ poste: { order: "asc" } }, { product: { name: "asc" } }],
    }),
    prisma.serviceDay.findUnique({ where: { date } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">À préparer avant 16 h</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Cochez chaque produit au fur et à mesure, puis validez.
        </p>
      </div>

      <PrepChecklist
        isReady={Boolean(serviceDay?.readyAt)}
        items={items.map((i) => ({
          id: i.id,
          productName: i.product.name,
          posteName: i.poste.name,
          unit: i.product.unit,
          quantityNeeded: i.quantityNeeded,
          checked: i.checked,
          depotQuantity: i.product.depotQuantity,
        }))}
      />
    </div>
  );
}
