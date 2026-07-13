"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { ADMIN_MOBILE_NAV_LINKS } from "./nav-links";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();

  if (role !== "ADMIN") return null;

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--border)] bg-white/95 backdrop-blur md:hidden">
      {ADMIN_MOBILE_NAV_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              active ? "text-[var(--color-palm-600)]" : "text-[var(--foreground)]/55"
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.4 : 2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
