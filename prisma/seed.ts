import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generatePartsChecklist } from "../src/lib/part-generator";
import type { BodyType, Transmission } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  // ---- Admin ----
  const passwordHash = await bcrypt.hash("juca2026", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", name: "Juca", passwordHash },
  });

  // ---- Configurações da loja ----
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // ---- Veículos de demonstração ----
  if ((await prisma.vehicle.count()) > 0) {
    console.log("Veículos já existem — pulando seed de demonstração.");
    return;
  }

  const demoVehicles = [
    {
      brand: "GM - Chevrolet",
      model: "Corsa Sed. Classic Life 1.8 8V",
      modelYear: 2005,
      fuel: "Gasolina",
      fipeCode: "004232-8",
      doors: 4,
      body: "SEDAN",
      engine: "1.8 8V",
      engineFamily: "GM Powertech 1.8 8V (Flexpower)",
      transmission: "MANUAL",
      color: "Prata",
      auctioneer: "Leilões DETRAN-SP / Freitas",
      lotNumber: "L-0342",
      auctionDate: new Date("2026-05-14"),
      purchaseValue: 4200,
      auctionNotes: "Batida frontal leve, motor girando.",
    },
    {
      brand: "Fiat",
      model: "Strada Working 1.4 Fire Flex 8V CS",
      modelYear: 2012,
      fuel: "Flex",
      fipeCode: "001449-9",
      doors: 2,
      body: "PICAPE",
      engine: "1.4 8V",
      engineFamily: "Fiat Fire / Fire Evo",
      transmission: "MANUAL",
      color: "Branca",
      auctioneer: "Sodré Santoro (leilão DETRAN)",
      lotNumber: "88710",
      auctionDate: new Date("2026-06-02"),
      purchaseValue: 7900,
      auctionNotes: "Capotamento, mecânica boa.",
    },
    {
      brand: "VW - VolksWagen",
      model: "Gol 1.0 Mi 8V G4 4p",
      modelYear: 2009,
      fuel: "Flex",
      fipeCode: "005340-0",
      doors: 4,
      body: "HATCH",
      engine: "1.0 8V",
      engineFamily: "VW EA111",
      transmission: "MANUAL",
      color: "Preto",
      auctioneer: "Zukerman Leilões (DETRAN)",
      lotNumber: "23117",
      auctionDate: new Date("2026-06-20"),
      purchaseValue: 3600,
      auctionNotes: "Lateral direita danificada.",
    },
  ] as const;

  // Peças que já entram como disponíveis na vitrine, com preço
  const highlight: Record<string, { price: number; featured?: boolean }> = {
    "Farol esquerdo": { price: 120, featured: true },
    "Farol direito": { price: 120 },
    "Alternador": { price: 250, featured: true },
    "Motor de partida": { price: 220 },
    "Câmbio completo": { price: 850, featured: true },
    "Cabeçote": { price: 600, featured: true },
    "Porta dianteira esquerda": { price: 300 },
    "Porta dianteira direita": { price: 300 },
    "Capô": { price: 280, featured: true },
    "Lanterna traseira esquerda": { price: 80 },
    "Lanterna traseira direita": { price: 80 },
    "Painel de instrumentos": { price: 180 },
    "Radiador": { price: 160, featured: true },
    "Eletroventilador (ventoinha)": { price: 130 },
    "Banco do motorista": { price: 200 },
    "Jogo de rodas de aço": { price: 350 },
    "Retrovisor externo esquerdo": { price: 60 },
    "Retrovisor externo direito": { price: 60 },
    "Tampa da caçamba": { price: 380 },
    "Para-choque traseiro": { price: 150 },
  };
  // Peças tipicamente inservíveis nos veículos de demonstração
  const scrapByVehicle: Record<number, string[]> = {
    0: ["Para-choque dianteiro", "Grade dianteira", "Painel frontal (travessa do radiador)", "Condensador do ar-condicionado"],
    1: ["Teto", "Para-brisa", "Forro do teto", "Vidro traseiro (vigia)"],
    2: ["Porta dianteira direita", "Paralama dianteiro direito", "Vidro de porta dianteira direita"],
  };

  for (let i = 0; i < demoVehicles.length; i++) {
    const v = demoVehicles[i];
    const vehicle = await prisma.vehicle.create({ data: { ...v } });
    const checklist = generatePartsChecklist({
      doors: v.doors,
      body: v.body as BodyType,
      transmission: v.transmission as Transmission,
    });
    const scrap = new Set(scrapByVehicle[i] ?? []);
    await prisma.part.createMany({
      data: checklist.map((t) => {
        const h = highlight[t.name];
        return {
          vehicleId: vehicle.id,
          name: t.name,
          group: t.group,
          quantity: t.qty ?? 1,
          status: scrap.has(t.name) ? "SUCATA" : h ? "DISPONIVEL" : "AVALIAR",
          price: h?.price ?? null,
          featured: h?.featured ?? false,
        };
      }),
    });
    console.log(`Veículo criado: ${v.brand} ${v.model} (${checklist.length} peças)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
