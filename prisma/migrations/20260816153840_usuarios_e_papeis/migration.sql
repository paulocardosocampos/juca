-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "resetTokenHash" TEXT,
    "resetTokenExp" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "id", "name", "passwordHash", "username") SELECT "createdAt", "id", "name", "passwordHash", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Quem já usava o sistema antes dos papéis é o dono: sem isto todos cairiam
-- no padrão STAFF e ninguém conseguiria gerenciar usuários.
UPDATE "User" SET "role" = 'OWNER' WHERE "username" = 'admin';

-- Rede de segurança para instalações cujo administrador tenha outro nome:
-- promove o usuário mais antigo se nenhum dono tiver sobrado.
UPDATE "User" SET "role" = 'OWNER'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "role" = 'OWNER')
  AND "id" = (SELECT "id" FROM "User" ORDER BY "createdAt" ASC LIMIT 1);
