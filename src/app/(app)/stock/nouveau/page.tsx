import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/stock" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/60">
        <ArrowLeft size={16} /> Retour au stock
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Ajouter un produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
