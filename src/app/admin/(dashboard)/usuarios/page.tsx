import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/permissions";
import { formatDate } from "@/lib/format";
import { UsersManager, type UserRow } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Usuários" };

export default async function UsersPage() {
  const me = await currentUser();
  // Funcionário não gerencia acessos: volta para o painel em vez de ver a tela.
  if (!me) redirect("/admin/login");
  if (me.role !== "OWNER") redirect("/admin");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      createdAt: true,
      resetTokenHash: true,
      resetTokenExp: true,
    },
  });

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    createdAt: formatDate(u.createdAt),
    hasActiveReset: Boolean(u.resetTokenHash && u.resetTokenExp && u.resetTokenExp > new Date()),
    resetExpires: u.resetTokenExp ? formatDate(u.resetTokenExp) : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-gold mb-2">
          Acessos
        </p>
        <h1 className="display text-[26px]">Usuários do sistema</h1>
        <p className="text-[13px] text-white/40 mt-2 max-w-xl leading-relaxed">
          O perfil <b className="text-white/70">Dono</b> vê tudo, inclusive quanto cada
          veículo custou no leilão. O <b className="text-white/70">Funcionário</b> cuida do
          estoque — cadastra peças, sobe fotos e marca vendas — sem enxergar esses valores.
        </p>
      </div>

      <UsersManager users={rows} meId={me.id} />
    </div>
  );
}
