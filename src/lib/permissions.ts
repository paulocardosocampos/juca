import { auth } from "@/auth";

export const ROLES = {
  OWNER: { label: "Dono", hint: "Acesso total, inclusive aos dados de leilão" },
  STAFF: { label: "Funcionário", hint: "Cuida do estoque, sem ver os dados de leilão" },
} as const;

export type Role = keyof typeof ROLES;

export function isRole(value: string): value is Role {
  return value in ROLES;
}

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

/** Usuário da requisição atual, ou null se não houver sessão. */
export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const role = session.user.role;
  return {
    id: session.user.id,
    name: session.user.name ?? "",
    role: isRole(role) ? role : "STAFF",
  };
}

/** Exige sessão. Use no topo de páginas e server actions do admin. */
export async function requireUser(): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error("Não autorizado");
  return user;
}

/**
 * Exige o perfil de dono. Protege a gestão de usuários e tudo que envolve
 * dados de leilão — valor de arremate, leiloeiro, margem.
 */
export async function requireOwner(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "OWNER") {
    throw new Error("Esta ação é restrita ao dono do sistema.");
  }
  return user;
}

/** Só o dono enxerga o que o veículo custou e de onde veio. */
export function canSeeAuctionData(user: SessionUser | null): boolean {
  return user?.role === "OWNER";
}
