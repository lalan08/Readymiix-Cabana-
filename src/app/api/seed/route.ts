import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { seedDatabase } from "@/lib/seed-data";

function tokenMatches(provided: string, expected: string) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  const expected = process.env.SEED_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Endpoint désactivé." }, { status: 404 });
  }

  const provided = request.nextUrl.searchParams.get("token") ?? "";
  if (!tokenMatches(provided, expected)) {
    return NextResponse.json({ error: "Jeton invalide." }, { status: 401 });
  }

  await seedDatabase(prisma);

  return NextResponse.json({
    message: "Base de données initialisée avec succès (opération sans risque à rejouer, tout est mis à jour via upsert).",
    comptes: [
      "Allan (admin) : persaudallan@gmail.com / code 1234",
      "Talia (admin) : talia@readymiixcabana.com / code 1111",
      "Grenadine (Bar & Caïpis) : grenadine@readymiixcabana.com / code 2001",
      "Océane (Cuisine) : oceane@readymiixcabana.com / code 2002",
      "Cynthia (Accueil & Boissons) : cynthia@readymiixcabana.com / code 2003",
    ],
  });
}
