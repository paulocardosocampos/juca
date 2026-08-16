"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isRole, requireOwner, requireUser, type Role } from "@/lib/permissions";

const RESET_TTL_HOURS = 48; // o link vai por WhatsApp: precisa de folga
const MIN_PASSWORD = 8;

export interface ActionResult {
  ok: boolean;
  message: string;
  /** Preenchido só quando a ação gera um link de redefinição. */
  resetPath?: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD) {
    return `A senha precisa de pelo menos ${MIN_PASSWORD} caracteres.`;
  }
  return null;
}

/** Impede que o sistema fique sem ninguém capaz de gerenciar usuários. */
async function assertNotLastOwner(userId: string, action: string): Promise<string | null> {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (target?.role !== "OWNER") return null;
  const owners = await prisma.user.count({ where: { role: "OWNER" } });
  if (owners <= 1) {
    return `Este é o único dono do sistema — ${action} deixaria o painel sem quem gerencie usuários.`;
  }
  return null;
}

// ---------------------------------------------------------------- criar

export async function createUser(formData: FormData): Promise<ActionResult> {
  await requireOwner();

  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "STAFF");
  const password = String(formData.get("password") ?? "");

  if (!/^[a-z0-9._-]{3,}$/.test(username)) {
    return {
      ok: false,
      message: "Usuário: mínimo 3 caracteres, apenas letras, números, ponto, hífen ou sublinhado.",
    };
  }
  if (!name) return { ok: false, message: "Informe o nome da pessoa." };
  if (!isRole(roleRaw)) return { ok: false, message: "Perfil inválido." };

  const invalid = validatePassword(password);
  if (invalid) return { ok: false, message: invalid };

  const exists = await prisma.user.findUnique({ where: { username } });
  if (exists) return { ok: false, message: `Já existe um usuário "${username}".` };

  await prisma.user.create({
    data: {
      username,
      name,
      role: roleRaw as Role,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Usuário "${username}" criado.` };
}

// ---------------------------------------------------------------- editar

export async function updateUser(formData: FormData): Promise<ActionResult> {
  const owner = await requireOwner();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "");

  if (!id || !name) return { ok: false, message: "Dados incompletos." };
  if (!isRole(roleRaw)) return { ok: false, message: "Perfil inválido." };

  // Rebaixar o próprio perfil tiraria o acesso do próprio dono à tela.
  if (id === owner.id && roleRaw !== "OWNER") {
    return { ok: false, message: "Você não pode rebaixar o seu próprio perfil." };
  }
  if (roleRaw !== "OWNER") {
    const blocked = await assertNotLastOwner(id, "rebaixá-lo");
    if (blocked) return { ok: false, message: blocked };
  }

  await prisma.user.update({
    where: { id },
    data: { name, role: roleRaw as Role },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true, message: "Usuário atualizado." };
}

// ---------------------------------------------------------------- remover

export async function deleteUser(formData: FormData): Promise<ActionResult> {
  const owner = await requireOwner();
  const id = String(formData.get("id") ?? "");

  if (id === owner.id) {
    return { ok: false, message: "Você não pode remover a própria conta." };
  }
  const blocked = await assertNotLastOwner(id, "removê-lo");
  if (blocked) return { ok: false, message: blocked };

  const user = await prisma.user.findUnique({ where: { id }, select: { username: true } });
  if (!user) return { ok: false, message: "Usuário não encontrado." };

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  return { ok: true, message: `Usuário "${user.username}" removido.` };
}

// ------------------------------------------------- link de redefinição

/**
 * Gera um link de uso único para a pessoa criar uma senha nova. O dono repassa
 * por WhatsApp. Guardamos apenas o hash: nem com acesso ao banco alguém remonta
 * o link.
 */
export async function createResetLink(formData: FormData): Promise<ActionResult> {
  await requireOwner();
  const id = String(formData.get("id") ?? "");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { username: true },
  });
  if (!user) return { ok: false, message: "Usuário não encontrado." };

  const token = crypto.randomBytes(32).toString("base64url");
  await prisma.user.update({
    where: { id },
    data: {
      resetTokenHash: hashToken(token),
      resetTokenExp: new Date(Date.now() + RESET_TTL_HOURS * 60 * 60 * 1000),
    },
  });

  revalidatePath("/admin/usuarios");
  return {
    ok: true,
    message: `Link gerado para "${user.username}". Vale ${RESET_TTL_HOURS} horas e só pode ser usado uma vez.`,
    resetPath: `/admin/redefinir/${token}`,
  };
}

export async function revokeResetLink(formData: FormData): Promise<ActionResult> {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  await prisma.user.update({
    where: { id },
    data: { resetTokenHash: null, resetTokenExp: null },
  });
  revalidatePath("/admin/usuarios");
  return { ok: true, message: "Link cancelado." };
}

// ------------------------------------------------ trocar a própria senha

export async function changeOwnPassword(formData: FormData): Promise<ActionResult> {
  const me = await requireUser();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) return { ok: false, message: "Usuário não encontrado." };

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) return { ok: false, message: "A senha atual está incorreta." };

  if (next !== confirm) return { ok: false, message: "A confirmação não confere." };
  const invalid = validatePassword(next);
  if (invalid) return { ok: false, message: invalid };
  if (next === current) {
    return { ok: false, message: "A senha nova precisa ser diferente da atual." };
  }

  await prisma.user.update({
    where: { id: me.id },
    data: {
      passwordHash: await bcrypt.hash(next, 10),
      resetTokenHash: null,
      resetTokenExp: null,
    },
  });

  return { ok: true, message: "Senha alterada." };
}

// ------------------------------------------- redefinir a partir do link

export async function resetPasswordWithToken(formData: FormData): Promise<ActionResult> {
  const token = String(formData.get("token") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (next !== confirm) return { ok: false, message: "A confirmação não confere." };
  const invalid = validatePassword(next);
  if (invalid) return { ok: false, message: invalid };

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: hashToken(token),
      resetTokenExp: { gt: new Date() },
    },
    select: { id: true },
  });
  if (!user) {
    return { ok: false, message: "Link inválido ou expirado. Peça um novo ao dono." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await bcrypt.hash(next, 10),
      resetTokenHash: null, // uso único
      resetTokenExp: null,
    },
  });

  return { ok: true, message: "Senha criada. Você já pode entrar." };
}
