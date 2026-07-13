import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const [product, postes] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.poste.findMany({ orderBy: { order: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link href="/stock" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/60">
        <ArrowLeft size={16} /> Retour aux produits
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-palm-900)]">Modifier le produit</h1>
      <ProductForm
        postes={postes}
        initial={{
          id: product.id,
          name: product.name,
          posteId: product.posteId,
          groupe: product.groupe ?? "",
          quantity: product.quantity,
          unit: product.unit,
          targetQuantity: product.targetQuantity,
          depotQuantity: product.depotQuantity,
          comment: product.comment ?? "",
          photoUrl: product.photoUrl ?? "",
        }}
      />
    </div>
  );
}
