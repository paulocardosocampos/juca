"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { JucaLogo } from "@/components/logo";

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-3 text-[14px] text-white outline-none transition-colors focus:border-gold";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen glow-gold flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <JucaLogo priority className="h-24 w-auto mb-8" />

        <h1 className="display text-[26px]">Área do gestor</h1>
        <p className="text-[13px] text-white/40 mt-2">
          Acesso restrito. Os dados de leilão só aparecem aqui dentro.
        </p>

        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
            >
              Usuário
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className={FIELD}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={FIELD}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-[13px] text-signal-bad bg-signal-bad/10 border border-signal-bad/25 rounded-lg px-3.5 py-3"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-gold hover:bg-gold-400 disabled:opacity-50 text-base text-[12px] font-bold tracking-[0.12em] uppercase py-3.5 transition-colors cursor-pointer"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
