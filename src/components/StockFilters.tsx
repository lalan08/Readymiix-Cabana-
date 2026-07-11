"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";

export function StockFilters({
  categories,
}: {
  categories: { id: string; name: string; icon: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function update(params: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            update({ q: e.target.value || null });
          }}
          placeholder="Rechercher un produit..."
          className="tap-target w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-palm-500)]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <select
          value={searchParams.get("statut") ?? ""}
          onChange={(e) => update({ statut: e.target.value || null })}
          className="tap-target shrink-0 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          <option value="SUFFISANT">🟢 Suffisant</option>
          <option value="FAIBLE">🟠 Faible</option>
          <option value="RUPTURE">🔴 Rupture</option>
        </select>

        <select
          value={searchParams.get("categorie") ?? ""}
          onChange={(e) => update({ categorie: e.target.value || null })}
          className="tap-target shrink-0 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
