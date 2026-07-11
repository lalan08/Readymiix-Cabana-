import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/stock" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/60">
        <ArrowLeft size={16} /> Retour au stock
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Modifier le produit</h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          categoryId: product.categoryId,
          quantity: product.quantity,
          unit: product.unit,
          minQuantity: product.minQuantity,
          idealQuantity: product.idealQuantity,
          location: product.location ?? "",
          supplier: product.supplier ?? "",
          purchasePrice: product.purchasePrice?.toString() ?? "",
          comment: product.comment ?? "",
          photoUrl: product.photoUrl ?? "",
        }}
      />
    </div>
  );
}
