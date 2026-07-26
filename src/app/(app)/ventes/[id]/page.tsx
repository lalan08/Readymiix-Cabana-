import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/menu";
import { PAYMENT_METHOD_LABEL } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const sale = await prisma.sale.findUnique({ where: { id }, include: { items: true } });
  if (!sale) notFound();

  return (
    <div className="space-y-5">
      <Link href="/ventes" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/60">
        <ArrowLeft size={16} /> Retour aux ventes
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">{formatPrice(sale.total)}</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          {new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(sale.createdAt)}
        </p>
      </div>

      <div className="card flex items-center justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50">Encaissé par</p>
          <p className="font-semibold">{sale.userName}</p>
        </div>
        <span className={`status-pill ${sale.paymentMethod === "ESPECES" ? "status-ok" : "status-planned"}`}>
          {PAYMENT_METHOD_LABEL[sale.paymentMethod]}
        </span>
      </div>

      <div className="space-y-2.5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/50">Articles</h2>
        <div className="card divide-y divide-[var(--border)] p-0">
          {sale.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-xs text-[var(--foreground)]/60">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="shrink-0 font-bold text-[var(--color-palm-900)]">{formatPrice(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card flex items-center justify-between p-4 text-lg font-extrabold text-[var(--color-palm-900)]">
        <span>Total</span>
        <span>{formatPrice(sale.total)}</span>
      </div>
    </div>
  );
}
