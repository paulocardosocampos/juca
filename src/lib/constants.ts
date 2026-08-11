export const BODY_TYPES = [
  { value: "HATCH", label: "Hatch" },
  { value: "SEDAN", label: "Sedã" },
  { value: "PICAPE", label: "Picape" },
  { value: "SUV", label: "SUV" },
  { value: "PERUA", label: "Perua / SW" },
  { value: "UTILITARIO", label: "Utilitário / Van" },
] as const;

export type BodyType = (typeof BODY_TYPES)[number]["value"];

export const TRANSMISSIONS = [
  { value: "MANUAL", label: "Manual" },
  { value: "AUTOMATICO", label: "Automático" },
] as const;

export type Transmission = (typeof TRANSMISSIONS)[number]["value"];

// Etiquetas de status no tema escuro: fundo translúcido + borda da própria cor,
// que é o que mantém legibilidade sobre superfícies escuras.
export const PART_STATUS = {
  AVALIAR: {
    label: "Avaliar",
    color: "bg-white/8 text-white/60 border border-white/12",
    dot: "bg-white/40",
  },
  DISPONIVEL: {
    label: "Disponível",
    color: "bg-signal-ok/12 text-signal-ok border border-signal-ok/25",
    dot: "bg-signal-ok",
  },
  VENDIDA: {
    label: "Vendida",
    color: "bg-signal-info/12 text-signal-info border border-signal-info/25",
    dot: "bg-signal-info",
  },
  SUCATA: {
    label: "Sucata (venda por peso)",
    color: "bg-signal-warn/12 text-signal-warn border border-signal-warn/25",
    dot: "bg-signal-warn",
  },
  DESCARTE: {
    label: "Descarte / reciclagem",
    color: "bg-signal-bad/12 text-signal-bad border border-signal-bad/25",
    dot: "bg-signal-bad",
  },
} as const;

export type PartStatus = keyof typeof PART_STATUS;

export const VEHICLE_STATUS = {
  DESMANCHE: {
    label: "Em desmanche",
    color: "bg-signal-ok/12 text-signal-ok border border-signal-ok/25",
  },
  FINALIZADO: {
    label: "Finalizado",
    color: "bg-white/8 text-white/50 border border-white/12",
  },
} as const;

export type VehicleStatus = keyof typeof VEHICLE_STATUS;

export const PART_GROUPS = [
  "Motor",
  "Câmbio e Transmissão",
  "Suspensão e Direção",
  "Freios",
  "Elétrica e Injeção",
  "Arrefecimento",
  "Lataria e Estrutura",
  "Vidros e Retrovisores",
  "Iluminação",
  "Interior e Acabamento",
  "Rodas e Pneus",
  "Acessórios e Outros",
] as const;

export type PartGroup = (typeof PART_GROUPS)[number];
