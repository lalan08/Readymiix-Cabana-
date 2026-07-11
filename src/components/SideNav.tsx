"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import { NAV_LINKS } from "./nav-links";

export function SideNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = NAV_LINKS.filter((l) => !l.roles || l.roles.includes(role));

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--color-palm-600)] text-white"
                : "text-[var(--foreground)]/75 hover:bg-[var(--color-sand-100)]"
            }`}
          >
            <Icon size={19} strokeWidth={2.2} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
