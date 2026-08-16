"use client";

import { useState, useTransition } from "react";
import { changeOwnPassword } from "@/app/admin/users-actions";
import type { ActionResult } from "@/app/admin/users-actions";

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-3 text-[13px] text-white outline-none transition-colors focus:border-gold";
const LABEL =
  "block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2";

export function PasswordForm() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          const r = await changeOwnPassword(fd);
          setResult(r);
          if (r.ok) (document.getElementById("form-senha") as HTMLFormElement)?.reset();
        })
      }
      id="form-senha"
      className="rounded-xl border border-white/8 bg-surface p-6 space-y-4 max-w-md"
    >
      <div>
        <label htmlFor="current" className={LABEL}>Senha atual</label>
        <input id="current" name="current" type="password" required autoComplete="current-password" className={FIELD} />
      </div>
      <div>
        <label htmlFor="next" className={LABEL}>Nova senha (mín. 8)</label>
        <input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" className={FIELD} />
      </div>
      <div>
        <label htmlFor="confirm" className={LABEL}>Repita a nova senha</label>
        <input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className={FIELD} />
      </div>

      {result && (
        <p
          className={`text-[12px] rounded-lg px-3 py-2 ${
            result.ok
              ? "bg-signal-ok/10 border border-signal-ok/30 text-signal-ok"
              : "bg-signal-bad/10 border border-signal-bad/30 text-signal-bad"
          }`}
        >
          {result.message}
        </p>
      )}

      <button
        disabled={pending}
        className="w-full rounded-lg bg-gold hover:bg-gold-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase py-3.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        {pending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
