"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";
import { JucaMark } from "@/components/mascot";

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-3 text-[14px] text-white outline-none transition-colors focus:border-flame";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen glow-flame flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <JucaMark className="w-6 h-auto text-flame" />
          <span className="text-[13px] font-bold tracking-[0.14em] uppercase">
            Juca<span className="text-white/35"> · Carros Velhos</span>
          </span>
        </div>

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
            className="w-full rounded-lg bg-flame hover:bg-flame-400 disabled:opacity-50 text-base text-[12px] font-bold tracking-[0.12em] uppercase py-3.5 transition-colors cursor-pointer"
          >
            {pending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
