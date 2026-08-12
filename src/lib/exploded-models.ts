import type { PartGroup } from "@/lib/constants";

// Regra de classificação: o primeiro padrão que casar com o nome do nó define o
// grupo da peça. A ordem importa — "Steering Wheel" precisa cair em Interior
// antes que /wheel/ o mande para Rodas.
export interface GroupRule {
  match: RegExp;
  group: PartGroup;
}

export interface ExplodedModel {
  id: string;
  /** Nome exibido no seletor. Nunca usar a marca real do carro na vitrine. */
  label: string;
  sublabel: string;
  url: string;
  credit: { author: string; license: string; url: string };
  /** Distância da explosão, multiplicador sobre o tamanho normalizado. */
  spread: number;
  rules: GroupRule[];
  /** Uso comercial pendente de autorização do autor. */
  restricted?: boolean;
}

const FALLBACK: PartGroup = "Lataria e Estrutura";

export const MODELS: ExplodedModel[] = [
  {
    id: "db11",
    label: "Cupê 5.2 V12",
    sublabel: "9 conjuntos · 156 mil polígonos · 4,1 MB",
    url: "/models/db11.glb",
    credit: {
      author: "Hari",
      license: "CC-BY-4.0",
      url: "https://sketchfab.com/Hari31",
    },
    spread: 0.30,
    rules: [
      { match: /steering wheel/i, group: "Interior e Acabamento" },
      { match: /brake caliper/i, group: "Freios" },
      { match: /exhaust/i, group: "Acessórios e Outros" },
      { match: /radiator/i, group: "Arrefecimento" },
      { match: /engine|twin turbo/i, group: "Motor" },
      { match: /light/i, group: "Iluminação" },
      { match: /glass|windscreen|wiper/i, group: "Vidros e Retrovisores" },
      { match: /interior|seat|stitching|buttons|speedo/i, group: "Interior e Acabamento" },
      { match: /wheel|tire/i, group: "Rodas e Pneus" },
      { match: /chassis|hood|bumper|door|boot|spoiler|plate|trunk|badge|bolt/i, group: FALLBACK },
    ],
  },
  {
    id: "polo",
    label: "Hatch 1.4 16V",
    sublabel: "7 conjuntos · 102 mil polígonos · 3,8 MB",
    url: "/models/polo.glb",
    credit: {
      author: "Ddiaz Design",
      license: "CC-BY-NC-SA-4.0",
      url: "https://sketchfab.com/ddiaz-design",
    },
    spread: 0.29,
    restricted: true,
    rules: [
      { match: /caliper/i, group: "Freios" },
      { match: /headlight|taillight/i, group: "Iluminação" },
      { match: /hood/i, group: FALLBACK },
      { match: /wheel|rim|tire/i, group: "Rodas e Pneus" },
      { match: /glass|window|windscreen/i, group: "Vidros e Retrovisores" },
      { match: /cockpit|interior|seat|dash/i, group: "Interior e Acabamento" },
      { match: /undercarriage|suspension/i, group: "Suspensão e Direção" },
      { match: /engine|motor/i, group: "Motor" },
      { match: /body|bumper|trunk|door|fender/i, group: FALLBACK },
    ],
  },
  {
    id: "uno",
    label: "Popular 1.0 8V",
    sublabel: "6 conjuntos · 184 mil polígonos · 4,2 MB",
    url: "/models/uno.glb",
    credit: {
      author: "bruno_sales",
      license: "CC-BY-4.0",
      url: "https://sketchfab.com/bruno_sales",
    },
    spread: 0.34,
    rules: [
      { match: /pneu|roda|calota|estepe/i, group: "Rodas e Pneus" },
      { match: /motor/i, group: "Motor" },
      { match: /lanterna|farol/i, group: "Iluminação" },
      { match: /vidro|parabrisa/i, group: "Vidros e Retrovisores" },
      { match: /interna|banco|painel/i, group: "Interior e Acabamento" },
      { match: /porta|^cap|corpo|malas|capo/i, group: FALLBACK },
    ],
  },
];

export function classify(nodeName: string, rules: GroupRule[]): PartGroup {
  // O three.js sanitiza os nomes ao carregar o glTF: "Front Left Brake Caliper"
  // chega aqui como "Front_Left_Brake_Caliper". Sem normalizar, toda regra de
  // duas palavras falha silenciosamente — era o que fazia "Freios" desaparecer
  // e o volante cair em "Rodas e Pneus".
  const nome = nodeName.replace(/[_\-.]+/g, " ");
  for (const r of rules) if (r.match.test(nome)) return r.group;
  return FALLBACK;
}

/** Cor de realce por grupo — usada no rótulo e no highlight de hover. */
export const GROUP_ACCENT: Record<string, string> = {
  Motor: "#f0b41c",
  "Câmbio e Transmissão": "#fcd427",
  "Suspensão e Direção": "#c9a227",
  Freios: "#e5484d",
  "Elétrica e Injeção": "#ffd166",
  Arrefecimento: "#3aa8c1",
  "Lataria e Estrutura": "#8c9199",
  "Vidros e Retrovisores": "#6fb3d6",
  Iluminação: "#ffcc4d",
  "Interior e Acabamento": "#b08968",
  "Rodas e Pneus": "#5c6169",
  "Acessórios e Outros": "#9b8aa6",
};
