// Preparação do banco em produção: garante que exista um usuário
// administrador e o registro de configurações da loja.
//
// Diferente de prisma/seed.ts (que cria veículos de demonstração para o
// ambiente de desenvolvimento), este script NÃO insere dados fictícios —
// o site sobe vazio, pronto para o estoque real.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const username = (process.env.ADMIN_USERNAME || "admin").trim();
const displayName = (process.env.ADMIN_NAME || "Juca").trim();

async function main() {
  await prisma.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });

  const existing = await prisma.user.findUnique({ where: { username } });
  const envPassword = process.env.ADMIN_PASSWORD?.trim();

  if (existing) {
    // Trocar ADMIN_PASSWORD na stack e reimplantar redefine a senha.
    if (envPassword) {
      const same = await bcrypt.compare(envPassword, existing.passwordHash);
      if (!same) {
        await prisma.user.update({
          where: { username },
          data: { passwordHash: await bcrypt.hash(envPassword, 10) },
        });
        console.log(`[juca] senha do usuário "${username}" atualizada a partir de ADMIN_PASSWORD.`);
      }
    }
    console.log(`[juca] usuário administrador "${username}" já existe.`);
    return;
  }

  const password = envPassword || crypto.randomBytes(9).toString("base64url");
  await prisma.user.create({
    data: {
      username,
      name: displayName,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  if (envPassword) {
    console.log(`[juca] usuário administrador "${username}" criado com a senha de ADMIN_PASSWORD.`);
  } else {
    console.log(
      "\n=========================================================\n" +
        `  ADMIN CRIADO — usuário: ${username}\n` +
        `  SENHA GERADA: ${password}\n` +
        "  Anote agora: ela só aparece neste log.\n" +
        "  Para definir a sua, use ADMIN_PASSWORD na stack.\n" +
        "=========================================================\n",
    );
  }
}

main()
  .catch((e) => {
    console.error("[juca] falha ao preparar o banco:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
