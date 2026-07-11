import { PrismaClient, Unit } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Gobelets 500 ml", icon: "🥤" },
  { name: "Gobelets 700 ml", icon: "🥤" },
  { name: "Couvercles", icon: "🔘" },
  { name: "Pailles", icon: "🥢" },
  { name: "Sacs et emballages", icon: "🛍️" },
  { name: "Glace", icon: "🧊" },
  { name: "Alcools", icon: "🥃" },
  { name: "Sirops", icon: "🍯" },
  { name: "Jus", icon: "🧃" },
  { name: "Citrons", icon: "🍋" },
  { name: "Fruits frais", icon: "🍉" },
  { name: "Fraises", icon: "🍓" },
  { name: "Maracuja", icon: "🥭" },
  { name: "Bonbons", icon: "🍬" },
  { name: "Décorations", icon: "🎉" },
  { name: "Nourriture", icon: "🍢" },
  { name: "Sauces", icon: "🌶️" },
  { name: "Produits d'entretien", icon: "🧽" },
  { name: "Matériel divers", icon: "🧰" },
];

async function main() {
  const site = await prisma.site.upsert({
    where: { id: "stand-principal" },
    update: {},
    create: { id: "stand-principal", name: "Stand ReadyMiix Cabana" },
  });

  for (const [i, c] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: { icon: c.icon, order: i },
      create: { name: c.name, icon: c.icon, order: i },
    });
  }
  const categories = await prisma.category.findMany();
  const byName = (name: string) => categories.find((c) => c.name === name)!.id;

  const admin = await prisma.user.upsert({
    where: { email: "persaudallan@gmail.com" },
    update: {},
    create: {
      name: "Allan Persaud",
      email: "persaudallan@gmail.com",
      pinHash: await bcrypt.hash("1234", 10),
      role: "ADMIN",
      siteId: site.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "responsable@readymiixcabana.com" },
    update: {},
    create: {
      name: "Responsable Stand",
      email: "responsable@readymiixcabana.com",
      pinHash: await bcrypt.hash("2345", 10),
      role: "MANAGER",
      siteId: site.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "employe@readymiixcabana.com" },
    update: {},
    create: {
      name: "Employé Stand",
      email: "employe@readymiixcabana.com",
      pinHash: await bcrypt.hash("3456", 10),
      role: "EMPLOYEE",
      siteId: site.id,
    },
  });

  const products: {
    name: string;
    category: string;
    quantity: number;
    unit: Unit;
    min: number;
    ideal: number;
    location?: string;
    supplier?: string;
    price?: number;
  }[] = [
    { name: "Gobelets 500 ml", category: "Gobelets 500 ml", quantity: 8, unit: "CARTON", min: 3, ideal: 10, location: "Réserve A", supplier: "Distripak", price: 22 },
    { name: "Gobelets 700 ml", category: "Gobelets 700 ml", quantity: 2, unit: "CARTON", min: 3, ideal: 10, location: "Réserve A", supplier: "Distripak", price: 26 },
    { name: "Couvercles dômes", category: "Couvercles", quantity: 6, unit: "PAQUET", min: 4, ideal: 12, location: "Réserve A", supplier: "Distripak", price: 8 },
    { name: "Pailles jumbo", category: "Pailles", quantity: 1, unit: "PAQUET", min: 2, ideal: 6, location: "Comptoir", supplier: "Distripak", price: 5 },
    { name: "Sacs plastique", category: "Sacs et emballages", quantity: 5, unit: "PAQUET", min: 3, ideal: 8, location: "Comptoir" },
    { name: "Glace pilée", category: "Glace", quantity: 4, unit: "SAC", min: 5, ideal: 15, location: "Congélateur", supplier: "Glaces du Sud", price: 4.5 },
    { name: "Rhum blanc", category: "Alcools", quantity: 3, unit: "BOUTEILLE", min: 2, ideal: 6, location: "Bar", supplier: "Cave Tropicale", price: 18 },
    { name: "Rhum ambré", category: "Alcools", quantity: 0, unit: "BOUTEILLE", min: 2, ideal: 6, location: "Bar", supplier: "Cave Tropicale", price: 19 },
    { name: "Vodka", category: "Alcools", quantity: 5, unit: "BOUTEILLE", min: 2, ideal: 6, location: "Bar", supplier: "Cave Tropicale", price: 17 },
    { name: "Sirop passion", category: "Sirops", quantity: 1, unit: "BOUTEILLE", min: 2, ideal: 5, location: "Bar", supplier: "Monin", price: 9 },
    { name: "Sirop fraise", category: "Sirops", quantity: 4, unit: "BOUTEILLE", min: 2, ideal: 5, location: "Bar", supplier: "Monin", price: 9 },
    { name: "Sirop coco", category: "Sirops", quantity: 3, unit: "BOUTEILLE", min: 2, ideal: 5, location: "Bar", supplier: "Monin", price: 9 },
    { name: "Jus d'ananas", category: "Jus", quantity: 6, unit: "LITRE", min: 4, ideal: 12, location: "Frigo", price: 3.2 },
    { name: "Jus d'orange", category: "Jus", quantity: 2, unit: "LITRE", min: 4, ideal: 12, location: "Frigo", price: 3.2 },
    { name: "Citrons verts", category: "Citrons", quantity: 1.5, unit: "KILOGRAMME", min: 2, ideal: 5, location: "Frigo", price: 3 },
    { name: "Citrons jaunes", category: "Citrons", quantity: 3, unit: "KILOGRAMME", min: 2, ideal: 5, location: "Frigo", price: 2.8 },
    { name: "Pastèque", category: "Fruits frais", quantity: 2, unit: "PIECE", min: 2, ideal: 5, location: "Frigo" },
    { name: "Ananas", category: "Fruits frais", quantity: 4, unit: "PIECE", min: 2, ideal: 6, location: "Frigo" },
    { name: "Fraises", category: "Fraises", quantity: 0.5, unit: "KILOGRAMME", min: 1, ideal: 3, location: "Frigo", price: 6 },
    { name: "Maracuja", category: "Maracuja", quantity: 2, unit: "KILOGRAMME", min: 1, ideal: 3, location: "Frigo", price: 7 },
    { name: "Bonbons assortis", category: "Bonbons", quantity: 3, unit: "PAQUET", min: 2, ideal: 6, location: "Comptoir" },
    { name: "Parasols décoratifs", category: "Décorations", quantity: 25, unit: "PIECE", min: 20, ideal: 60, location: "Réserve B" },
    { name: "Chips", category: "Nourriture", quantity: 6, unit: "PAQUET", min: 4, ideal: 10, location: "Réserve B" },
    { name: "Sauce piquante", category: "Sauces", quantity: 2, unit: "BOUTEILLE", min: 1, ideal: 3, location: "Bar" },
    { name: "Liquide vaisselle", category: "Produits d'entretien", quantity: 1, unit: "BOUTEILLE", min: 1, ideal: 3, location: "Réserve C" },
    { name: "Essuie-tout", category: "Produits d'entretien", quantity: 2, unit: "PAQUET", min: 2, ideal: 5, location: "Réserve C" },
    { name: "Glacières portables", category: "Matériel divers", quantity: 3, unit: "PIECE", min: 2, ideal: 4, location: "Réserve B" },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        name: p.name,
        categoryId: byName(p.category),
        quantity: p.quantity,
        unit: p.unit,
        minQuantity: p.min,
        idealQuantity: p.ideal,
        location: p.location,
        supplier: p.supplier,
        purchasePrice: p.price,
        siteId: site.id,
        updatedById: admin.id,
        movements: {
          create: {
            type: "CREATION",
            oldQty: 0,
            newQty: p.quantity,
            delta: p.quantity,
            userId: admin.id,
            comment: "Stock initial",
          },
        },
      },
    });
  }

  console.log("Seed terminé.");
  console.log("Comptes de démonstration (à changer en production) :");
  console.log("  Admin        : persaudallan@gmail.com / code 1234");
  console.log("  Responsable  : responsable@readymiixcabana.com / code 2345");
  console.log("  Employé      : employe@readymiixcabana.com / code 3456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
