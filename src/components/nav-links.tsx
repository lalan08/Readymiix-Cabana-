import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  History,
  AlertTriangle,
  ClipboardCheck,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
};

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/reappro", label: "Réappro", icon: ClipboardList },
  { href: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
  { href: "/pertes", label: "Pertes", icon: AlertTriangle },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/utilisateurs", label: "Utilisateurs", icon: Users, roles: ["ADMIN"] },
  { href: "/parametres", label: "Paramètres", icon: Settings, roles: ["ADMIN", "MANAGER"] },
];

export const MOBILE_NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/reappro", label: "Réappro", icon: ClipboardList },
  { href: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
  { href: "/historique", label: "Historique", icon: History },
];
