import type { PaymentMethod } from "@prisma/client";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  ESPECES: "Espèces",
  CARTE: "Carte",
};
