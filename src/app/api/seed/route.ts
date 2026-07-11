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

  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    return NextResponse.json({
      message: "La base contient déjà des utilisateurs, aucune action effectuée.",
    });
  }

  await seedDatabase(prisma);

  return NextResponse.json({
    message: "Base de données initialisée avec succès.",
    comptes: [
      "Admin : persaudallan@gmail.com / code 1234",
      "Responsable : responsable@readymiixcabana.com / code 2345",
      "Employé : employe@readymiixcabana.com / code 3456",
    ],
  });
}
