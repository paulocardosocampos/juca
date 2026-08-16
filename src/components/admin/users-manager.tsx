"use client";

import { useState, useTransition } from "react";
import {
  createResetLink,
  createUser,
  deleteUser,
  revokeResetLink,
  updateUser,
  type ActionResult,
} from "@/app/admin/users-actions";
import { ROLES } from "@/lib/permissions";

export interface UserRow {
  id: string;
  username: string;
  name: string;
  role: string;
  createdAt: string;
  hasActiveReset: boolean;
  resetExpires: string | null;
}

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-gold";
const LABEL =
  "block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2";

function Feedback({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p
      className={`text-[12px] rounded-lg px-3 py-2 ${
        result.ok
          ? "bg-signal-ok/10 border border-signal-ok/30 text-signal-ok"
          : "bg-signal-bad/10 border border-signal-bad/30 text-signal-bad"
      }`}
    >
      {result.message}
    </p>
  );
}

/** Caixa com o link pronto para copiar e mandar no WhatsApp. */
function ResetLinkBox({ path, onClose }: { path: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const full = typeof window === "undefined" ? path : `${window.location.origin}${path}`;

  return (
    <div className="rounded-xl border border-gold/40 bg-gold/5 p-4 space-y-3">
      <p className="text-[12px] text-white/70">
        Link de uso único. Copie e mande para a pessoa — ele deixa de valer assim
        que a senha for criada.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={full}
          onFocus={(e) => e.currentTarget.select()}
          className={`${FIELD} font-mono text-[11px]`}
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(full);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="shrink-0 rounded-lg bg-gold hover:bg-gold-400 text-base text-[11px] font-bold tracking-[0.1em] uppercase px-4 transition-colors cursor-pointer"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg border border-white/15 hover:border-white/35 text-[11px] px-3 transition-colors cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function UserCard({ user, meId }: { user: UserRow; meId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const isMe = user.id === meId;

  function run(action: (fd: FormData) => Promise<ActionResult>, fd: FormData) {
    start(async () => {
      const r = await action(fd);
      setResult(r);
      if (r.resetPath) setLink(r.resetPath);
      if (r.ok && !r.resetPath) setEditing(false);
    });
  }

  return (
    <div className={`rounded-xl border border-white/8 bg-surface p-5 ${pending ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-white flex items-center gap-2">
            {user.name}
            {isMe && (
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/35">
                você
              </span>
            )}
          </p>
          <p className="text-[12px] text-white/40 mt-0.5">
            {user.username} · criado em {user.createdAt}
          </p>
        </div>
        <span
          className={`text-[10px] font-bold tracking-[0.12em] uppercase rounded-full px-3 py-1.5 ${
            user.role === "OWNER"
              ? "bg-gold/15 text-gold border border-gold/30"
              : "border border-white/12 text-white/60"
          }`}
        >
          {ROLES[user.role as keyof typeof ROLES]?.label ?? user.role}
        </span>
      </div>

      {user.hasActiveReset && !link && (
        <p className="mt-3 text-[11px] text-gold">
          Existe um link de redefinição ativo{user.resetExpires ? ` até ${user.resetExpires}` : ""}.
        </p>
      )}

      {editing && (
        <form
          action={(fd) => {
            fd.set("id", user.id);
            run(updateUser, fd);
          }}
          className="mt-4 grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end"
        >
          <div>
            <label className={LABEL}>Nome</label>
            <input name="name" defaultValue={user.name} className={FIELD} required />
          </div>
          <div>
            <label className={LABEL}>Perfil</label>
            <select name="role" defaultValue={user.role} className={FIELD}>
              {Object.entries(ROLES).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <button
            disabled={pending}
            className="rounded-lg bg-gold hover:bg-gold-400 text-base text-[11px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 transition-colors cursor-pointer"
          >
            Salvar
          </button>
        </form>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setEditing(!editing)}
          className="text-[11px] font-semibold border border-white/12 hover:border-white/30 rounded-lg px-3.5 py-2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          {editing ? "Cancelar" : "Editar"}
        </button>

        <form
          action={(fd) => {
            fd.set("id", user.id);
            run(createResetLink, fd);
          }}
        >
          <button
            disabled={pending}
            className="text-[11px] font-semibold border border-white/12 hover:border-gold/50 rounded-lg px-3.5 py-2 text-white/70 hover:text-gold transition-colors cursor-pointer"
          >
            Gerar link de nova senha
          </button>
        </form>

        {user.hasActiveReset && (
          <form
            action={(fd) => {
              fd.set("id", user.id);
              run(revokeResetLink, fd);
            }}
          >
            <button
              disabled={pending}
              className="text-[11px] font-semibold border border-white/12 hover:border-white/30 rounded-lg px-3.5 py-2 text-white/50 transition-colors cursor-pointer"
            >
              Cancelar link
            </button>
          </form>
        )}

        {!isMe && (
          <form
            action={(fd) => {
              if (!confirm(`Remover o usuário "${user.username}"? Ele perde o acesso imediatamente.`)) {
                return;
              }
              fd.set("id", user.id);
              run(deleteUser, fd);
            }}
            className="ml-auto"
          >
            <button
              disabled={pending}
              className="text-[11px] font-semibold text-signal-bad hover:underline px-2 py-2 transition-colors cursor-pointer"
            >
              Remover
            </button>
          </form>
        )}
      </div>

      {(result || link) && (
        <div className="mt-4 space-y-3">
          <Feedback result={result} />
          {link && <ResetLinkBox path={link} onClose={() => setLink(null)} />}
        </div>
      )}
    </div>
  );
}

export function UsersManager({ users, meId }: { users: UserRow[]; meId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-white/45">
          {users.length} usuário{users.length === 1 ? "" : "s"} com acesso ao painel.
        </p>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg bg-gold hover:bg-gold-400 text-base text-[11px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 transition-colors cursor-pointer"
        >
          {open ? "Fechar" : "+ Novo usuário"}
        </button>
      </div>

      {open && (
        <form
          action={(fd) =>
            start(async () => {
              const r = await createUser(fd);
              setResult(r);
              if (r.ok) setOpen(false);
            })
          }
          className="rounded-xl border border-white/8 bg-surface p-5 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nome da pessoa</label>
              <input name="name" required className={FIELD} placeholder="Ex.: Maria" />
            </div>
            <div>
              <label className={LABEL}>Usuário (para entrar)</label>
              <input name="username" required className={FIELD} placeholder="maria" />
            </div>
            <div>
              <label className={LABEL}>Perfil</label>
              <select name="role" defaultValue="STAFF" className={FIELD}>
                {Object.entries(ROLES).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label} — {meta.hint}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Senha inicial (mín. 8)</label>
              <input name="password" type="text" required minLength={8} className={FIELD} />
            </div>
          </div>
          <button
            disabled={pending}
            className="rounded-lg bg-gold hover:bg-gold-400 text-base text-[11px] font-bold tracking-[0.1em] uppercase px-6 py-3 transition-colors cursor-pointer disabled:opacity-50"
          >
            {pending ? "Criando..." : "Criar usuário"}
          </button>
        </form>
      )}

      <Feedback result={result} />

      <div className="space-y-3">
        {users.map((u) => (
          <UserCard key={u.id} user={u} meId={meId} />
        ))}
      </div>
    </div>
  );
}
