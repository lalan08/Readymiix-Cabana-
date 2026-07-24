import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MenuItemsManager } from "@/components/MenuItemsManager";

export const dynamic = "force-dynamic";

export default async function MenuItemsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/caisse");

  const items = await prisma.menuItem.findMany({
    where: { archived: false },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-5">
      <Link href="/caisse" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/60">
        <ArrowLeft size={16} /> Retour à la caisse
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Produits vendus</h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Le catalogue et les prix affichés dans la caisse.
        </p>
      </div>

      <MenuItemsManager
        items={items.map((i) => ({
          id: i.id,
          name: i.name,
          category: i.category,
          price: i.price,
          photoUrl: i.photoUrl,
        }))}
      />
    </div>
  );
}
