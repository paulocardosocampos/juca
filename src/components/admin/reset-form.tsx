"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resetPasswordWithToken, type ActionResult } from "@/app/admin/users-actions";

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-3 text-[13px] text-white outline-none transition-colors focus:border-gold";
const LABEL =
  "block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2";

export function ResetForm({ token }: { token: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  if (result?.ok) {
    return (
      <div className="mt-8 rounded-xl border border-signal-ok/30 bg-signal-ok/10 p-5">
        <p className="text-[14px] font-bold text-signal-ok">Senha criada!</p>
        <p className="text-[13px] text-white/60 mt-1.5">
          Já pode entrar no painel com ela.
        </p>
        <Link
          href="/admin/login"
          className="inline-block mt-4 rounded-lg bg-gold hover:bg-gold-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3 transition-colors"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form
      action={(fd) => {
        fd.set("token", token);
        start(async () => setResult(await resetPasswordWithToken(fd)));
      }}
      className="mt-8 space-y-4"
    >
      <div>
        <label htmlFor="next" className={LABEL}>Nova senha (mín. 8)</label>
        <input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" className={FIELD} autoFocus />
      </div>
      <div>
        <label htmlFor="confirm" className={LABEL}>Repita a senha</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className={FIELD} />
      </div>

      {result && !result.ok && (
        <p className="text-[12px] rounded-lg px-3 py-2 bg-signal-bad/10 border border-signal-bad/30 text-signal-bad">
          {result.message}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-gold hover:bg-gold-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase py-3.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Criar senha"}
      </button>
    </form>
  );
}
