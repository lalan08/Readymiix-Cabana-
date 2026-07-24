import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
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
          <Link href="/caisse/produits" className="btn btn-secondary tap-target shrink-0 text-sm">
            <Settings size={16} /> Produits
          </Link>
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
          items={items.map((i) => ({ id: i.id, name: i.name, category: i.category, price: i.price }))}
        />
      )}
    </div>
  );
}
