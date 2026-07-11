import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-data";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(() => {
    console.log("Seed terminé.");
    console.log("Comptes de démonstration (à changer en production) :");
    console.log("  Admin        : persaudallan@gmail.com / code 1234");
    console.log("  Responsable  : responsable@readymiixcabana.com / code 2345");
    console.log("  Employé      : employe@readymiixcabana.com / code 3456");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
