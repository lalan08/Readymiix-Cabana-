"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

export function HistoryFilters({
  postes,
  users,
}: {
  postes: { id: string; name: string }[];
  users: { id: string; name: string }[];
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
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <div className="card space-y-3 p-4">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          update({ q: e.target.value || null });
        }}
        placeholder="Rechercher un produit..."
        className="tap-target w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--color-palm-500)]"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select
          value={searchParams.get("poste") ?? ""}
          onChange={(e) => update({ poste: e.target.value || null })}
          className="tap-target rounded-xl border border-[var(--border)] bg-white px-2 py-2 text-xs"
        >
          <option value="">Tous les postes</option>
          {postes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("personne") ?? ""}
          onChange={(e) => update({ personne: e.target.value || null })}
          className="tap-target rounded-xl border border-[var(--border)] bg-white px-2 py-2 text-xs"
        >
          <option value="">Toutes les personnes</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={searchParams.get("du") ?? ""}
          onChange={(e) => update({ du: e.target.value || null })}
          className="tap-target rounded-xl border border-[var(--border)] bg-white px-2 py-2 text-xs"
        />
        <input
          type="date"
          value={searchParams.get("au") ?? ""}
          onChange={(e) => update({ au: e.target.value || null })}
          className="tap-target rounded-xl border border-[var(--border)] bg-white px-2 py-2 text-xs"
        />
      </div>
    </div>
  );
}
