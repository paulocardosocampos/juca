-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelYear" INTEGER NOT NULL,
    "fuel" TEXT,
    "fipeCode" TEXT,
    "fipeValue" REAL,
    "doors" INTEGER NOT NULL DEFAULT 4,
    "body" TEXT NOT NULL DEFAULT 'HATCH',
    "engine" TEXT,
    "engineFamily" TEXT,
    "transmission" TEXT NOT NULL DEFAULT 'MANUAL',
    "color" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DESMANCHE',
    "photos" TEXT NOT NULL DEFAULT '[]',
    "auctioneer" TEXT,
    "auctionName" TEXT,
    "lotNumber" TEXT,
    "auctionDate" DATETIME,
    "purchaseValue" REAL,
    "auctionNotes" TEXT,
    "arrivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Part" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'AVALIAR',
    "price" REAL,
    "soldPrice" REAL,
    "soldAt" DATETIME,
    "description" TEXT,
    "photos" TEXT NOT NULL DEFAULT '[]',
    "mlLink" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Part_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "storeName" TEXT NOT NULL DEFAULT 'Juca Carros Velhos',
    "whatsapp" TEXT NOT NULL DEFAULT '5514998664187',
    "phone2" TEXT NOT NULL DEFAULT '5514981473010',
    "facebook" TEXT NOT NULL DEFAULT 'https://www.facebook.com/JucaCarroVelhos',
    "instagram" TEXT,
    "tiktok" TEXT,
    "mercadoLivre" TEXT,
    "address" TEXT NOT NULL DEFAULT 'Rua Armando Polônio, 255 – Maria Luiza 3',
    "city" TEXT NOT NULL DEFAULT 'Bariri/SP',
    "mapsUrl" TEXT NOT NULL DEFAULT 'https://www.google.com/maps/place/Desmonte+juca+carros+velhos/@-22.0790115,-48.7581759,17z',
    "tagline" TEXT NOT NULL DEFAULT 'Peças usadas com procedência, direto do pátio!',
    "about" TEXT NOT NULL DEFAULT 'Desmanche legalizado pelo DETRAN-SP em Bariri. Compramos veículos em leilão, desmontamos com responsabilidade e vendemos peças usadas com procedência garantida.'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Part_vehicleId_idx" ON "Part"("vehicleId");

-- CreateIndex
CREATE INDEX "Part_status_idx" ON "Part"("status");
