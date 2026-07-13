import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const postes = await prisma.poste.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/stock" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/60">
        <ArrowLeft size={16} /> Retour aux produits
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Ajouter un produit</h1>
      <ProductForm postes={postes} />
    </div>
  );
}
