// Popula o site com veículos e peças de DEMONSTRAÇÃO, para apresentar a loja
// antes de existir estoque real.
//
//   node scripts/demo-seed.mjs           insere (não faz nada se já houver dados demo)
//   node scripts/demo-seed.mjs --force   insere de novo, mesmo já existindo
//   node scripts/demo-seed.mjs --clear   remove tudo que foi criado por aqui
//
// Na stack, DEMO_DATA=true faz o entrypoint rodar isto no boot.
//
// Os veículos criados aqui levam a marca abaixo em auctionName — é assim que
// o --clear sabe o que apagar sem tocar no estoque real.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEMO_TAG = "[DEMONSTRAÇÃO]";

const VEHICLES = [
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
    auctioneer: "Leilões DETRAN-SP",
    lotNumber: "L-0342",
    purchaseValue: 4200,
    parts: [
      ["Cabeçote", "Motor", 600, true],
      ["Alternador", "Motor", 250, true],
      ["Motor de partida", "Motor", 220],
      ["Coletor de admissão", "Motor", 140],
      ["Câmbio completo", "Câmbio e Transmissão", 850, true],
      ["Kit de embreagem (platô e disco)", "Câmbio e Transmissão", 180],
      ["Radiador", "Arrefecimento", 160, true],
      ["Eletroventilador (ventoinha)", "Arrefecimento", 130],
      ["Farol esquerdo", "Iluminação", 120, true],
      ["Farol direito", "Iluminação", 120],
      ["Lanterna traseira esquerda", "Iluminação", 80],
      ["Lanterna traseira direita", "Iluminação", 80],
      ["Porta dianteira esquerda", "Lataria e Estrutura", 300],
      ["Tampa do porta-malas", "Lataria e Estrutura", 260],
      ["Capô", "Lataria e Estrutura", 280, true],
      ["Painel de instrumentos", "Elétrica e Injeção", 180],
      ["Módulo de injeção (ECU)", "Elétrica e Injeção", 320],
      ["Banco do motorista", "Interior e Acabamento", 200],
      ["Jogo de rodas de aço", "Rodas e Pneus", 350],
      ["Retrovisor externo esquerdo", "Vidros e Retrovisores", 60],
    ],
    sold: [["Amortecedores dianteiros (par)", "Suspensão e Direção", 240]],
    scrap: [
      ["Para-choque dianteiro", "Lataria e Estrutura"],
      ["Grade dianteira", "Lataria e Estrutura"],
    ],
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
    auctioneer: "Sodré Santoro",
    lotNumber: "88710",
    purchaseValue: 7900,
    parts: [
      ["Cabeçote", "Motor", 580, true],
      ["Alternador", "Motor", 240],
      ["Bomba de combustível", "Motor", 190],
      ["Câmbio completo", "Câmbio e Transmissão", 900],
      ["Semieixo esquerdo", "Câmbio e Transmissão", 150],
      ["Radiador", "Arrefecimento", 170],
      ["Farol esquerdo", "Iluminação", 135, true],
      ["Farol direito", "Iluminação", 135],
      ["Tampa da caçamba", "Lataria e Estrutura", 380, true],
      ["Lateral da caçamba esquerda", "Lataria e Estrutura", 420],
      ["Porta dianteira direita", "Lataria e Estrutura", 320],
      ["Capô", "Lataria e Estrutura", 290],
      ["Para-choque traseiro", "Lataria e Estrutura", 150],
      ["Painel de instrumentos", "Elétrica e Injeção", 175],
      ["Chicote do motor", "Elétrica e Injeção", 210],
      ["Banco do motorista", "Interior e Acabamento", 190],
      ["Volante", "Interior e Acabamento", 120],
      ["Jogo de rodas de aço", "Rodas e Pneus", 340],
      ["Estepe", "Rodas e Pneus", 130],
      ["Caixa de direção", "Suspensão e Direção", 380],
    ],
    sold: [["Motor de partida", "Motor", 230]],
    scrap: [
      ["Teto", "Lataria e Estrutura"],
      ["Para-brisa", "Vidros e Retrovisores"],
    ],
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
    auctioneer: "Zukerman Leilões",
    lotNumber: "23117",
    purchaseValue: 3600,
    parts: [
      ["Cabeçote", "Motor", 520, true],
      ["Alternador", "Motor", 230],
      ["Motor de partida", "Motor", 210],
      ["Bobina de ignição", "Elétrica e Injeção", 95],
      ["Câmbio completo", "Câmbio e Transmissão", 780, true],
      ["Radiador", "Arrefecimento", 150],
      ["Farol esquerdo", "Iluminação", 110],
      ["Lanterna traseira esquerda", "Iluminação", 75],
      ["Lanterna traseira direita", "Iluminação", 75],
      ["Porta dianteira esquerda", "Lataria e Estrutura", 280, true],
      ["Porta traseira esquerda", "Lataria e Estrutura", 260],
      ["Capô", "Lataria e Estrutura", 250],
      ["Tampa traseira", "Lataria e Estrutura", 300],
      ["Painel de instrumentos", "Elétrica e Injeção", 160],
      ["Módulo de injeção (ECU)", "Elétrica e Injeção", 300],
      ["Banco traseiro", "Interior e Acabamento", 180],
      ["Jogo de forros de porta", "Interior e Acabamento", 140],
      ["Jogo de rodas de aço", "Rodas e Pneus", 320],
      ["Amortecedores dianteiros (par)", "Suspensão e Direção", 220],
      ["Retrovisor externo direito", "Vidros e Retrovisores", 55],
    ],
    sold: [["Alternador", "Motor", 240]],
    scrap: [
      ["Porta dianteira direita", "Lataria e Estrutura"],
      ["Paralama dianteiro direito", "Lataria e Estrutura"],
    ],
  },
];

async function clear() {
  const { count } = await prisma.vehicle.deleteMany({
    where: { auctionName: DEMO_TAG },
  });
  console.log(`[demo] ${count} veículo(s) de demonstração removido(s) (as peças vão junto).`);
}

async function insert(force) {
  const existing = await prisma.vehicle.count({ where: { auctionName: DEMO_TAG } });
  if (existing > 0 && !force) {
    console.log("[demo] dados de demonstração já presentes — nada a fazer.");
    return;
  }

  const hoje = new Date();
  for (let i = 0; i < VEHICLES.length; i++) {
    const v = VEHICLES[i];
    const arrivedAt = new Date(hoje.getTime() - (i + 1) * 8 * 24 * 60 * 60 * 1000);

    const vehicle = await prisma.vehicle.create({
      data: {
        brand: v.brand,
        model: v.model,
        modelYear: v.modelYear,
        fuel: v.fuel,
        fipeCode: v.fipeCode,
        doors: v.doors,
        body: v.body,
        engine: v.engine,
        engineFamily: v.engineFamily,
        transmission: v.transmission,
        color: v.color,
        auctioneer: v.auctioneer,
        auctionName: DEMO_TAG,
        lotNumber: v.lotNumber,
        auctionDate: arrivedAt,
        purchaseValue: v.purchaseValue,
        auctionNotes: "Veículo de demonstração — remova quando entrar estoque real.",
        arrivedAt,
      },
    });

    const rows = [
      ...v.parts.map(([name, group, price, featured]) => ({
        vehicleId: vehicle.id,
        name,
        group,
        status: "DISPONIVEL",
        price,
        featured: Boolean(featured),
      })),
      ...v.sold.map(([name, group, price]) => ({
        vehicleId: vehicle.id,
        name,
        group,
        status: "VENDIDA",
        price,
        soldPrice: price,
        soldAt: new Date(),
      })),
      ...v.scrap.map(([name, group]) => ({
        vehicleId: vehicle.id,
        name,
        group,
        status: "SUCATA",
      })),
    ];

    await prisma.part.createMany({ data: rows });
    console.log(`[demo] ${v.brand} ${v.model} ${v.modelYear} — ${rows.length} peças.`);
  }
}

const arg = process.argv[2];
const run = arg === "--clear" ? clear() : insert(arg === "--force");

run
  .catch((e) => {
    console.error("[demo] falhou:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
