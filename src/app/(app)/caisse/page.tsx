import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings, Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Caisse } from "@/components/Caisse";

export const dynamic = "force-dynamic";

export default async function CaissePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const items = await prisma.menuItem.findMany({
    where: { archived: false },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Caisse</h1>
        {session.role === "ADMIN" && (
          <div className="flex shrink-0 gap-2">
            <Link href="/ventes" className="btn btn-secondary btn-icon tap-target" aria-label="Ventes">
              <Receipt size={16} />
            </Link>
            <Link href="/caisse/produits" className="btn btn-secondary btn-icon tap-target" aria-label="Produits">
              <Settings size={16} />
            </Link>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--foreground)]/60">
          Aucun produit n&apos;a encore été configuré.
          {session.role === "ADMIN" && (
            <>
              {" "}
              <Link href="/caisse/produits" className="underline">
                Ajoutez-en un.
              </Link>
            </>
          )}
        </div>
      ) : (
        <Caisse
          items={items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            price: i.price,
            photoUrl: i.photoUrl,
          }))}
        />
      )}
    </div>
  );
}
