-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "storeName" TEXT NOT NULL DEFAULT 'Juca Carros Velhos',
    "whatsapp" TEXT NOT NULL DEFAULT '5514998664187',
    "phone2" TEXT NOT NULL DEFAULT '5514981473010',
    "facebook" TEXT NOT NULL DEFAULT 'https://www.facebook.com/anapaula.campos.731572',
    "instagram" TEXT,
    "tiktok" TEXT,
    "mercadoLivre" TEXT,
    "address" TEXT NOT NULL DEFAULT 'Rua Armando Polônio, 255 – Maria Luiza 3',
    "city" TEXT NOT NULL DEFAULT 'Bariri/SP',
    "mapsUrl" TEXT NOT NULL DEFAULT 'https://www.google.com/maps/place/Desmonte+juca+carros+velhos/@-22.0790115,-48.7581759,17z',
    "tagline" TEXT NOT NULL DEFAULT 'Peças usadas com procedência, direto do pátio!',
    "about" TEXT NOT NULL DEFAULT 'Desmanche legalizado pelo DETRAN-SP em Bariri. Compramos veículos em leilão, desmontamos com responsabilidade e vendemos peças usadas com procedência garantida.'
);
INSERT INTO "new_Settings" ("about", "address", "city", "facebook", "id", "instagram", "mapsUrl", "mercadoLivre", "phone2", "storeName", "tagline", "tiktok", "whatsapp") SELECT "about", "address", "city", "facebook", "id", "instagram", "mapsUrl", "mercadoLivre", "phone2", "storeName", "tagline", "tiktok", "whatsapp" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Corrige o link já gravado. A condição evita sobrescrever o valor caso o
-- gestor já o tenha ajustado pelo /admin — só troca se ainda for o padrão
-- antigo, que apontava para um perfil inexistente.
UPDATE "Settings"
SET "facebook" = 'https://www.facebook.com/anapaula.campos.731572'
WHERE "facebook" = 'https://www.facebook.com/JucaCarroVelhos';
