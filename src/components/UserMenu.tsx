"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { ROLE_LABEL } from "@/lib/roles";
import type { SessionUser } from "@/lib/auth";

export function UserMenu({
  user,
  variant,
}: {
  user: SessionUser;
  variant: "sidebar" | "header";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (variant === "sidebar") {
    return (
      <div className="rounded-xl bg-[var(--color-sand-100)] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-palm-600)] text-sm font-bold text-white">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-[var(--foreground)]/60">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <form action={logoutAction} className="mt-3">
          <button type="submit" className="btn btn-outline tap-target w-full text-sm">
            <LogOut size={16} /> Se déconnecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="tap-target flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--color-sand-100)]"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-palm-600)] text-xs font-bold text-white">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium sm:block">{user.name}</span>
        <ChevronDown size={16} className="text-[var(--foreground)]/50" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[var(--border)] bg-white p-2 shadow-lg">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <User size={16} className="text-[var(--foreground)]/50" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-[var(--foreground)]/60">{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-[var(--color-status-out)] hover:bg-[var(--color-status-out-bg)]"
            >
              <LogOut size={16} /> Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
