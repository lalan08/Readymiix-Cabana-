"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, KeyRound, Shield, ShieldOff } from "lucide-react";
import {
  createUserAction,
  updateUserRoleAction,
  toggleUserActiveAction,
  resetUserPinAction,
} from "@/lib/actions/users";
import { ROLE_LABEL } from "@/lib/roles";
import type { Role } from "@prisma/client";

type UserRow = { id: string; name: string; email: string; role: Role; active: boolean };

const ROLES: Role[] = ["ADMIN", "MANAGER", "EMPLOYEE"];

export function UsersManager({ users, currentUserId }: { users: UserRow[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", pin: "", role: "EMPLOYEE" as Role });

  function submitNewUser() {
    setError(null);
    startTransition(async () => {
      const res = await createUserAction(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setForm({ name: "", email: "", pin: "", role: "EMPLOYEE" });
      setShowForm(false);
      router.refresh();
    });
  }

  function resetPin(userId: string) {
    const pin = prompt("Nouveau code personnel (4 chiffres minimum) :");
    if (!pin) return;
    startTransition(async () => {
      await resetUserPinAction(userId, pin);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <button onClick={() => setShowForm((v) => !v)} className="btn btn-primary tap-target">
        <UserPlus size={16} /> Ajouter un utilisateur
      </button>

      {showForm && (
        <div className="card space-y-3 p-4">
          <input
            placeholder="Nom complet"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Adresse e-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input"
          />
          <input
            placeholder="Code personnel"
            value={form.pin}
            onChange={(e) => setForm((f) => ({ ...f, pin: e.target.value }))}
            className="input"
          />
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            className="input"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          {error && <p className="text-sm font-medium text-[var(--color-status-out)]">{error}</p>}
          <button onClick={submitNewUser} disabled={pending} className="btn btn-primary tap-target w-full">
            Créer le compte
          </button>
        </div>
      )}

      <div className="space-y-2.5">
        {users.map((u) => (
          <div key={u.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">
                {u.name} {u.id === currentUserId && <span className="text-xs text-[var(--foreground)]/40">(vous)</span>}
              </p>
              <p className="truncate text-xs text-[var(--foreground)]/60">{u.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={u.role}
                onChange={(e) =>
                  startTransition(async () => {
                    await updateUserRoleAction(u.id, e.target.value as Role);
                    router.refresh();
                  })
                }
                className="tap-target rounded-lg border border-[var(--border)] bg-white px-2 py-1.5 text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
              <button onClick={() => resetPin(u.id)} className="btn btn-secondary tap-target !px-2.5 !py-1.5 text-xs">
                <KeyRound size={13} /> Code
              </button>
              <button
                onClick={() =>
                  startTransition(async () => {
                    await toggleUserActiveAction(u.id, !u.active);
                    router.refresh();
                  })
                }
                disabled={u.id === currentUserId}
                className={`btn tap-target !px-2.5 !py-1.5 text-xs disabled:opacity-40 ${
                  u.active ? "btn-danger" : "btn-secondary"
                }`}
              >
                {u.active ? <ShieldOff size={13} /> : <Shield size={13} />}
                {u.active ? "Désactiver" : "Activer"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          background: white;
          padding: 0.65rem 0.9rem;
          font-size: 0.95rem;
          outline: none;
        }
      `}</style>
    </div>
  );
}
