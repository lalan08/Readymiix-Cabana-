import type { PrismaClient, Unit } from "@prisma/client";
import bcrypt from "bcryptjs";

type ProductSeed = {
  name: string;
  groupe: string;
  unit: Unit;
  target: number;
};

const POSTES: {
  name: string;
  order: number;
  responsibleEmail: string;
  products: ProductSeed[];
}[] = [
  {
    name: "Bar & Caïpis",
    order: 0,
    responsibleEmail: "grenadine@readymiixcabana.com",
    products: [
      { name: "Jus de citron", groupe: "Bases", unit: "LITRE", target: 3 },
      { name: "Rhum", groupe: "Bases", unit: "BOUTEILLE", target: 4 },
      { name: "Cachaça 51", groupe: "Bases", unit: "BOUTEILLE", target: 4 },
      { name: "Sucre", groupe: "Bases", unit: "KILOGRAMME", target: 2 },
      { name: "Glace en sacs de 5 kg", groupe: "Bases", unit: "SAC_5KG", target: 6 },

      { name: "Sirop Fraise", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Pêche", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Mangue", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Maracuja", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Ananas", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Fruits rouges", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Coco", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Cerise", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Myrtille", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Pomme verte", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Litchi", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },
      { name: "Sirop Kiwi", groupe: "Sirops", unit: "BOUTEILLE", target: 2 },

      { name: "Gobelets 500 ml", groupe: "Consommables", unit: "PAQUET", target: 10 },
      { name: "Gobelets 700 ml", groupe: "Consommables", unit: "PAQUET", target: 10 },
      { name: "Couvercles", groupe: "Consommables", unit: "PAQUET", target: 8 },
      { name: "Pailles", groupe: "Consommables", unit: "PAQUET", target: 6 },
    ],
  },
  {
    name: "Cuisine",
    order: 1,
    responsibleEmail: "oceane@readymiixcabana.com",
    products: [
      { name: "Poulet pané", groupe: "Protéines", unit: "PORTION", target: 30 },
      { name: "Poisson pané", groupe: "Protéines", unit: "PORTION", target: 20 },
      { name: "Crevettes panées", groupe: "Protéines", unit: "PORTION", target: 20 },

      { name: "Riz", groupe: "Accompagnements", unit: "KILOGRAMME", target: 5 },
      { name: "Frites", groupe: "Accompagnements", unit: "KILOGRAMME", target: 8 },
      { name: "Huile", groupe: "Accompagnements", unit: "LITRE", target: 5 },
      { name: "Oignons frits", groupe: "Accompagnements", unit: "PAQUET", target: 4 },

      { name: "Sauce blanche maison", groupe: "Sauces", unit: "LITRE", target: 2 },
      { name: "Ketchup", groupe: "Sauces", unit: "BOUTEILLE", target: 3 },
      { name: "Mayonnaise", groupe: "Sauces", unit: "BOUTEILLE", target: 3 },
      { name: "Sauce chili", groupe: "Sauces", unit: "BOUTEILLE", target: 2 },

      { name: "Sel", groupe: "Assaisonnements", unit: "KILOGRAMME", target: 1 },
      { name: "Persil", groupe: "Assaisonnements", unit: "PAQUET", target: 2 },

      { name: "Bowls", groupe: "Contenants", unit: "PIECE", target: 40 },
      { name: "Couvercles de bowls", groupe: "Contenants", unit: "PIECE", target: 40 },
      { name: "Couverts", groupe: "Contenants", unit: "PAQUET", target: 10 },
    ],
  },
  {
    name: "Accueil & Boissons",
    order: 2,
    responsibleEmail: "cynthia@readymiixcabana.com",
    products: [
      { name: "Rouleaux pour TPE", groupe: "Caisse", unit: "PIECE", target: 3 },

      { name: "Coca-Cola", groupe: "Softs et jus", unit: "CANETTE", target: 24 },
      { name: "Liptonic", groupe: "Softs et jus", unit: "CANETTE", target: 12 },
      { name: "Sprite", groupe: "Softs et jus", unit: "CANETTE", target: 12 },
      { name: "Fanta", groupe: "Softs et jus", unit: "CANETTE", target: 12 },
      { name: "Minute Maid pomme", groupe: "Softs et jus", unit: "CANETTE", target: 12 },
      { name: "Lipton Ice Tea", groupe: "Softs et jus", unit: "CANETTE", target: 12 },
      { name: "Eau", groupe: "Softs et jus", unit: "BOUTEILLE", target: 24 },

      { name: "Heineken", groupe: "Bières", unit: "BOUTEILLE", target: 24 },
      { name: "Desperados Red", groupe: "Bières", unit: "BOUTEILLE", target: 12 },
      { name: "Desperados classique", groupe: "Bières", unit: "BOUTEILLE", target: 12 },

      { name: "Red Bull", groupe: "Boissons énergisantes", unit: "CANETTE", target: 12 },
      { name: "Long Horn", groupe: "Boissons énergisantes", unit: "CANETTE", target: 12 },
    ],
  },
];

// Anciens produits placeholder (prix/étiquettes approximatifs) remplacés
// par le vrai menu Frozen Caïpi ci-dessous.
const STALE_MENU_ITEM_NAMES = [
  "Caïpirinha Fraise",
  "Caïpirinha Maracuja",
  "Caïpirinha Coco",
  "Caïpirinha Passion",
];

const FRUITE_FLAVORS: { name: string; photo: string }[] = [
  { name: "Fraise", photo: "caipi-fraise.jpg" },
  { name: "Pêche", photo: "caipi-peche.jpg" },
  { name: "Mangue", photo: "caipi-mangue.jpg" },
  { name: "Maracudja", photo: "caipi-maracuja.jpg" },
  { name: "Ananas", photo: "caipi-ananas.jpg" },
  { name: "Fruits rouges", photo: "caipi-fruits-rouges.jpg" },
  { name: "Coco", photo: "caipi-coco.jpg" },
  { name: "Cerise", photo: "caipi-cerise.jpg" },
  { name: "Myrtille", photo: "caipi-myrtille.jpg" },
  { name: "Pomme verte", photo: "caipi-pomme-verte.jpg" },
  { name: "Litchi", photo: "caipi-litchi.jpg" },
];

const MENU_ITEMS: { name: string; category: string; price: number; photoUrl?: string }[] = [
  { name: "Caïpi Classique (Citron vert) 500 ml", category: "Frozen Caïpi", price: 10, photoUrl: "/menu/caipi-classique.jpg" },
  { name: "Caïpi Classique (Citron vert) 700 ml", category: "Frozen Caïpi", price: 12, photoUrl: "/menu/caipi-classique.jpg" },
  ...FRUITE_FLAVORS.flatMap((f) => [
    { name: `Caïpi ${f.name} 500 ml`, category: "Frozen Caïpi", price: 12, photoUrl: `/menu/${f.photo}` },
    { name: `Caïpi ${f.name} 700 ml`, category: "Frozen Caïpi", price: 14, photoUrl: `/menu/${f.photo}` },
  ]),

  { name: "Supplément bonbons / topping", category: "Suppléments", price: 1 },

  { name: "Bowl Poulet", category: "Repas", price: 12 },
  { name: "Bowl Poisson", category: "Repas", price: 13 },
  { name: "Bowl Crevettes", category: "Repas", price: 14 },

  { name: "Coca-Cola", category: "Boissons", price: 3 },
  { name: "Eau", category: "Boissons", price: 2 },
  { name: "Heineken", category: "Boissons", price: 5 },
  { name: "Red Bull", category: "Boissons", price: 4 },
];

const USERS: { name: string; email: string; pin: string; role: "ADMIN" | "EMPLOYEE" }[] = [
  { name: "Allan Persaud", email: "persaudallan@gmail.com", pin: "1234", role: "ADMIN" },
  { name: "Talia", email: "talia@readymiixcabana.com", pin: "1111", role: "ADMIN" },
  { name: "Nathalie", email: "nathalie@readymiixcabana.com", pin: "4444", role: "ADMIN" },
  { name: "Joël", email: "joel@readymiixcabana.com", pin: "5555", role: "ADMIN" },
  { name: "Grenadine", email: "grenadine@readymiixcabana.com", pin: "2001", role: "EMPLOYEE" },
  { name: "Océane", email: "oceane@readymiixcabana.com", pin: "2002", role: "EMPLOYEE" },
  { name: "Cynthia", email: "cynthia@readymiixcabana.com", pin: "2003", role: "EMPLOYEE" },
];

export async function seedDatabase(prisma: PrismaClient) {
  const usersByEmail = new Map<string, { id: string }>();
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        pinHash: await bcrypt.hash(u.pin, 10),
        role: u.role,
      },
    });
    usersByEmail.set(u.email, user);
  }

  const admin = usersByEmail.get("persaudallan@gmail.com")!;

  for (const posteSeed of POSTES) {
    const responsible = usersByEmail.get(posteSeed.responsibleEmail);
    const poste = await prisma.poste.upsert({
      where: { name: posteSeed.name },
      update: { order: posteSeed.order, responsibleId: responsible?.id },
      create: {
        name: posteSeed.name,
        order: posteSeed.order,
        responsibleId: responsible?.id,
      },
    });

    for (const p of posteSeed.products) {
      const existing = await prisma.product.findFirst({
        where: { name: p.name, posteId: poste.id },
      });
      if (existing) continue;
      await prisma.product.create({
        data: {
          name: p.name,
          posteId: poste.id,
          groupe: p.groupe,
          unit: p.unit,
          targetQuantity: p.target,
          quantity: p.target,
          depotQuantity: p.target * 2,
          updatedById: admin.id,
          movements: {
            create: {
              type: "CREATION",
              oldQty: 0,
              newQty: p.target,
              delta: p.target,
              userId: admin.id,
              comment: "Stock initial",
            },
          },
        },
      });
    }
  }

  // Retire les anciens produits placeholder — remplacés ci-dessous par le
  // vrai menu. Ne touche à rien d'autre pour ne jamais écraser un prix
  // modifié depuis l'admin.
  await prisma.menuItem.deleteMany({ where: { name: { in: STALE_MENU_ITEM_NAMES } } });

  for (const [i, m] of MENU_ITEMS.entries()) {
    const existing = await prisma.menuItem.findFirst({ where: { name: m.name } });
    if (existing) continue;
    await prisma.menuItem.create({
      data: { name: m.name, category: m.category, price: m.price, photoUrl: m.photoUrl ?? null, order: i },
    });
  }
}
