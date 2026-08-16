import { redirect } from "next/navigation";
import { currentUser, ROLES } from "@/lib/permissions";
import { PasswordForm } from "@/components/admin/password-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Minha conta" };

export default async function AccountPage() {
  const me = await currentUser();
  if (!me) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-gold mb-2">
          Minha conta
        </p>
        <h1 className="display text-[26px]">{me.name}</h1>
        <p className="text-[13px] text-white/40 mt-2">
          Perfil: <b className="text-white/70">{ROLES[me.role].label}</b> — {ROLES[me.role].hint}.
        </p>
      </div>

      <div>
        <h2 className="text-[13px] font-bold text-white/70 mb-3">Alterar senha</h2>
        <PasswordForm />
      </div>
    </div>
  );
}
