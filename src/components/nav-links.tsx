import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  ClipboardCheck,
  ClipboardList,
  Warehouse,
  Package,
  AlertTriangle,
  History,
  Users,
  Settings,
  ShoppingCart,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const ADMIN_NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
  { href: "/preparation", label: "Préparation", icon: ClipboardList },
  { href: "/caisse", label: "Caisse", icon: ShoppingCart },
  { href: "/depot", label: "Dépôt", icon: Warehouse },
  { href: "/stock", label: "Produits", icon: Package },
  { href: "/pertes", label: "Pertes", icon: AlertTriangle },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export const EMPLOYEE_NAV_LINKS: NavLink[] = [
  { href: "/inventaire", label: "Mon poste", icon: ClipboardCheck },
  { href: "/caisse", label: "Caisse", icon: ShoppingCart },
];

export const ADMIN_MOBILE_NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
  { href: "/preparation", label: "Préparation", icon: ClipboardList },
  { href: "/caisse", label: "Caisse", icon: ShoppingCart },
  { href: "/depot", label: "Dépôt", icon: Warehouse },
];

export const EMPLOYEE_MOBILE_NAV_LINKS: NavLink[] = [
  { href: "/inventaire", label: "Mon poste", icon: ClipboardCheck },
  { href: "/caisse", label: "Caisse", icon: ShoppingCart },
];
