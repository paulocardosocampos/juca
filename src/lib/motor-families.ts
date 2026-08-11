// Heurística de família de motor pelos veículos mais comuns do Brasil.
// Serve como SUGESTÃO no cadastro — o gestor pode sempre ajustar.
interface MotorFamilyRule {
  brand: RegExp;
  model?: RegExp;
  engines?: string[]; // cilindradas: "1.0", "1.8"...
  yearFrom?: number;
  yearTo?: number;
  family: string;
}

const RULES: MotorFamilyRule[] = [
  // ------- Chevrolet / GM -------
  { brand: /chevrolet|gm/i, model: /onix|prisma|cobalt|spin/i, engines: ["1.0", "1.4", "1.8"], yearFrom: 2012, yearTo: 2019, family: "GM SPE/4 (Família I Ecoflex)" },
  { brand: /chevrolet|gm/i, model: /onix|tracker/i, engines: ["1.0", "1.2"], yearFrom: 2020, family: "GM CSS Prime Turbo (3 cil.)" },
  { brand: /chevrolet|gm/i, model: /corsa|celta|classic|agile|montana|prisma|meriva/i, engines: ["1.0", "1.4"], yearFrom: 2002, family: "GM VHC / VHCE (Família I)" },
  { brand: /chevrolet|gm/i, model: /corsa|celta|classic|agile|montana|meriva|astra/i, engines: ["1.8"], family: "GM Powertech 1.8 8V (Flexpower)" },
  { brand: /chevrolet|gm/i, model: /corsa|tigra/i, engines: ["1.0", "1.4", "1.6"], yearTo: 2001, family: "GM Família I (MPFI/EFI)" },
  { brand: /chevrolet|gm/i, model: /astra|vectra|zafira|s10|blazer/i, engines: ["2.0", "2.2", "2.4"], family: "GM Família II" },
  { brand: /chevrolet|gm/i, model: /kadett|monza|ipanema/i, family: "GM Família II (8V)" },
  // ------- Fiat -------
  { brand: /fiat/i, model: /uno|mobi|argo|cronos|fiorino|strada/i, engines: ["1.0", "1.3"], yearFrom: 2016, family: "Fiat Firefly (GSE)" },
  { brand: /fiat/i, model: /palio|uno|siena|strada|idea|punto|doblo|fiorino|grand siena/i, engines: ["1.0", "1.3", "1.4"], yearFrom: 2001, yearTo: 2016, family: "Fiat Fire / Fire Evo" },
  { brand: /fiat/i, model: /palio|siena|strada|idea|punto|linea|bravo|doblo|toro/i, engines: ["1.6", "1.8"], yearFrom: 2010, family: "Fiat E.torQ" },
  { brand: /fiat/i, model: /palio|siena|strada|idea/i, engines: ["1.8"], yearFrom: 2003, yearTo: 2010, family: "Powertrain 1.8 GM/Fiat" },
  { brand: /fiat/i, model: /uno|elba|premio|fiorino/i, yearTo: 2001, family: "Fiat Fiasa / Sevel" },
  { brand: /fiat/i, model: /tempra|tipo/i, family: "Fiat Sevel 2.0" },
  // ------- Volkswagen -------
  { brand: /volkswagen|vw/i, model: /gol|parati|saveiro|santana|voyage|passat|golf/i, engines: ["1.6", "1.8", "2.0"], yearTo: 2008, family: "VW AP (EA827)" },
  { brand: /volkswagen|vw/i, model: /gol|fox|polo|voyage|saveiro|up|crossfox|spacefox|kombi/i, engines: ["1.0", "1.6"], yearFrom: 2003, yearTo: 2016, family: "VW EA111" },
  { brand: /volkswagen|vw/i, model: /up|gol|polo|virtus|t-cross|saveiro|voyage|fox|nivus/i, engines: ["1.0", "1.4", "1.6"], yearFrom: 2014, family: "VW EA211 (MPI/TSI)" },
  { brand: /volkswagen|vw/i, model: /gol|parati/i, engines: ["1.0"], yearTo: 2005, family: "VW EA111 (Mi/Turbo 16V)" },
  { brand: /volkswagen|vw/i, model: /fusca|brasilia|kombi/i, yearTo: 1996, family: "VW Boxer refrigerado a ar" },
  // ------- Ford -------
  { brand: /ford/i, model: /ka|fiesta|ecosport|courier|focus/i, engines: ["1.0", "1.6"], yearFrom: 2000, yearTo: 2013, family: "Ford Zetec Rocam" },
  { brand: /ford/i, model: /fiesta|ecosport|ka|focus|new fiesta/i, engines: ["1.5", "1.6"], yearFrom: 2011, family: "Ford Sigma / TiVCT" },
  { brand: /ford/i, model: /ka\b/i, engines: ["1.0"], yearFrom: 2015, family: "Ford TiVCT 1.0 (3 cil.)" },
  { brand: /ford/i, model: /escort|hobby|verona|del rey|pampa|corcel|belina/i, engines: ["1.0", "1.6"], yearTo: 1996, family: "Ford CHT" },
  { brand: /ford/i, model: /escort|verona|mondeo|focus/i, engines: ["1.8", "2.0"], family: "Ford Zetec / Duratec" },
  // ------- Honda -------
  { brand: /honda/i, model: /civic|fit|city|hr-v|wr-v|accord|cr-v/i, yearFrom: 2001, family: "Honda i-VTEC" },
  { brand: /honda/i, model: /civic|accord/i, yearTo: 2000, family: "Honda D-Series (VTEC)" },
  // ------- Toyota -------
  { brand: /toyota/i, model: /corolla|etios|yaris|fielder|camry|rav4/i, family: "Toyota VVT-i / Dual VVT-i" },
  { brand: /toyota/i, model: /hilux|sw4/i, family: "Toyota KD / GD (diesel) ou VVT-i (flex)" },
  // ------- Renault -------
  { brand: /renault/i, model: /clio|kangoo|sandero|logan|kwid|twingo/i, engines: ["1.0"], family: "Renault D4D / SCe (B4D)" },
  { brand: /renault/i, model: /clio|sandero|logan|megane|scenic|kangoo/i, engines: ["1.6"], yearTo: 2016, family: "Renault K7M (8V) / K4M (16V)" },
  { brand: /renault/i, model: /duster|fluence|megane/i, engines: ["2.0"], family: "Renault F4R" },
  // ------- Peugeot / Citroën -------
  { brand: /peugeot|citro/i, model: /206|207|c3|hoggar|picasso/i, engines: ["1.4"], family: "PSA TU3 (8V)" },
  { brand: /peugeot|citro/i, model: /206|207|307|c3|c4|picasso|xsara/i, engines: ["1.6"], yearTo: 2012, family: "PSA TU5 (16V)" },
  { brand: /peugeot|citro/i, model: /208|2008|c3|c4 cactus|aircross/i, engines: ["1.5", "1.6"], yearFrom: 2013, family: "PSA EC5" },
  { brand: /peugeot|citro/i, engines: ["1.6"], yearFrom: 2016, model: /thp|208|3008|c4/i, family: "PSA EP6 THP" },
  // ------- Hyundai / Kia -------
  { brand: /hyundai/i, model: /hb20|creta/i, engines: ["1.0"], family: "Hyundai Kappa (3 cil.)" },
  { brand: /hyundai|kia/i, model: /hb20|creta|i30|cerato|soul/i, engines: ["1.6", "2.0"], family: "Hyundai/Kia Gamma / Nu" },
  // ------- Nissan -------
  { brand: /nissan/i, model: /march|versa|kicks|sentra/i, engines: ["1.0", "1.6", "2.0"], family: "Nissan HR / MR" },
  // ------- Mitsubishi -------
  { brand: /mitsubishi/i, model: /l200|pajero/i, family: "Mitsubishi 4D56 / 4M40 (diesel)" },
];

export function suggestMotorFamily(
  brand: string,
  model: string,
  year: number,
  engine?: string | null,
): string | null {
  const displacement = engine?.match(/\d\.\d/)?.[0];
  for (const rule of RULES) {
    if (!rule.brand.test(brand)) continue;
    if (rule.model && !rule.model.test(model)) continue;
    if (rule.engines && displacement && !rule.engines.includes(displacement)) continue;
    if (rule.engines && !displacement) continue;
    if (rule.yearFrom && year < rule.yearFrom) continue;
    if (rule.yearTo && year > rule.yearTo) continue;
    return rule.family;
  }
  return null;
}
