"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyPin } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const pin = String(formData.get("pin") || "").trim();
  const next = String(formData.get("next") || "/dashboard");

  if (!email || !pin) {
    return { error: "Merci de renseigner votre e-mail et votre code personnel." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return { error: "Identifiants incorrects ou compte désactivé." };
  }

  const valid = await verifyPin(pin, user.pinHash);
  if (!valid) {
    return { error: "Identifiants incorrects." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  redirect(next && next.startsWith("/") ? next : "/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
