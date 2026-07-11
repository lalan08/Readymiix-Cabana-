"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[var(--color-palm-900)]">
          Adresse e-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="prenom@readymiix.com"
          className="tap-target w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--color-palm-500)] focus:ring-2 focus:ring-[var(--color-palm-100)]"
        />
      </div>
      <div>
        <label htmlFor="pin" className="mb-1 block text-sm font-semibold text-[var(--color-palm-900)]">
          Code personnel
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          required
          placeholder="••••"
          className="tap-target w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--color-palm-500)] focus:ring-2 focus:ring-[var(--color-palm-100)]"
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-[var(--color-status-out-bg)] px-4 py-3 text-sm font-medium text-[var(--color-status-out)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary tap-target w-full text-base disabled:opacity-60"
      >
        {pending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
