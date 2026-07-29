import type { Role } from "@prisma/client";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrateur",
  EMPLOYEE: "Employé",
};
