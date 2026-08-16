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
    // O administrador da stack é sempre o dono: sem isto ele cairia no papel
    // padrão (STAFF) e ninguém conseguiria gerenciar usuários.
    if (existing.role !== "OWNER") {
      await prisma.user.update({ where: { username }, data: { role: "OWNER" } });
      console.log(`[juca] usuário "${username}" promovido a dono.`);
    }
    // Trocar ADMIN_PASSWORD na stack e reimplantar redefine a senha — mas só
    // quando o valor da stack realmente muda.
    //
    // Comparar com a senha gravada não serve: depois que alguém troca a senha
    // em /admin/conta, ela passa a diferir da stack para sempre, e todo deploy
    // desfaria a troca sem avisar. Por isso guardamos a marca do último valor
    // aplicado e agimos apenas quando essa marca muda.
    if (envPassword) {
      const stamp = crypto.createHash("sha256").update(envPassword).digest("hex");
      const settings = await prisma.settings.findUnique({
        where: { id: 1 },
        select: { adminPwStamp: true },
      });

      if (settings?.adminPwStamp !== stamp) {
        await prisma.user.update({
          where: { username },
          data: {
            passwordHash: await bcrypt.hash(envPassword, 10),
            resetTokenHash: null,
            resetTokenExp: null,
          },
        });
        await prisma.settings.update({ where: { id: 1 }, data: { adminPwStamp: stamp } });
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
      role: "OWNER",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  // Marca o valor já aplicado, senão o boot seguinte acharia que a stack mudou
  // e reescreveria a senha logo depois de criá-la.
  if (envPassword) {
    await prisma.settings.update({
      where: { id: 1 },
      data: { adminPwStamp: crypto.createHash("sha256").update(envPassword).digest("hex") },
    });
  }

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
