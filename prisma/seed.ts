import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seed-data";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(() => {
    console.log("Seed terminé.");
    console.log("Comptes (à changer en production) :");
    console.log("  Allan (admin)  : persaudallan@gmail.com / code 1234");
    console.log("  Talia (admin)  : talia@readymiixcabana.com / code 1111");
    console.log("  Grenadine (Bar & Caïpis)      : grenadine@readymiixcabana.com / code 2001");
    console.log("  Océane (Cuisine)              : oceane@readymiixcabana.com / code 2002");
    console.log("  Cynthia (Accueil & Boissons)  : cynthia@readymiixcabana.com / code 2003");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
