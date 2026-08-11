import type { BodyType, PartGroup, Transmission } from "./constants";

// Catálogo-gabarito de peças de um veículo de passeio nacional.
// Ao cadastrar um veículo, o gerador filtra este catálogo pelas
// características (portas, carroceria, câmbio) e cria o checklist.
//
// Itens de segurança NÃO reutilizáveis por lei (Lei 12.977/2014 +
// Resolução CONTRAN, ex.: airbags e cintos de segurança) ficam FORA
// do catálogo de revenda propositalmente.
export interface PartTemplate {
  name: string;
  group: PartGroup;
  qty?: number; // padrão 1
  bodies?: BodyType[]; // se definido, só gera para essas carrocerias
  minDoors?: number; // se definido, só gera se doors >= minDoors
  transmission?: Transmission; // se definido, só gera para esse câmbio
}

export const PARTS_CATALOG: PartTemplate[] = [
  // ---------------- MOTOR ----------------
  { name: "Motor completo (parcial)", group: "Motor" },
  { name: "Cabeçote", group: "Motor" },
  { name: "Bloco do motor", group: "Motor" },
  { name: "Cárter", group: "Motor" },
  { name: "Virabrequim", group: "Motor" },
  { name: "Comando de válvulas", group: "Motor" },
  { name: "Pistões e bielas (jogo)", group: "Motor" },
  { name: "Coletor de admissão", group: "Motor" },
  { name: "Coletor de escape", group: "Motor" },
  { name: "Tampa de válvulas", group: "Motor" },
  { name: "Polia do virabrequim", group: "Motor" },
  { name: "Volante do motor", group: "Motor" },
  { name: "Bomba de óleo", group: "Motor" },
  { name: "Bomba de combustível", group: "Motor" },
  { name: "Bicos injetores (jogo)", group: "Motor" },
  { name: "Corpo de borboleta (TBI)", group: "Motor" },
  { name: "Alternador", group: "Motor" },
  { name: "Motor de partida", group: "Motor" },
  { name: "Compressor do ar-condicionado", group: "Motor" },
  { name: "Coxins do motor (jogo)", group: "Motor" },

  // ---------------- CÂMBIO E TRANSMISSÃO ----------------
  { name: "Câmbio completo", group: "Câmbio e Transmissão" },
  { name: "Kit de embreagem (platô e disco)", group: "Câmbio e Transmissão", transmission: "MANUAL" },
  { name: "Trambulador e varões", group: "Câmbio e Transmissão", transmission: "MANUAL" },
  { name: "Alavanca de câmbio", group: "Câmbio e Transmissão" },
  { name: "Módulo do câmbio automático (TCU)", group: "Câmbio e Transmissão", transmission: "AUTOMATICO" },
  { name: "Semieixo esquerdo", group: "Câmbio e Transmissão" },
  { name: "Semieixo direito", group: "Câmbio e Transmissão" },
  { name: "Juntas homocinéticas (par)", group: "Câmbio e Transmissão" },
  { name: "Diferencial traseiro", group: "Câmbio e Transmissão", bodies: ["PICAPE", "SUV", "UTILITARIO"] },
  { name: "Eixo cardan", group: "Câmbio e Transmissão", bodies: ["PICAPE", "SUV", "UTILITARIO"] },

  // ---------------- SUSPENSÃO E DIREÇÃO ----------------
  { name: "Amortecedores dianteiros (par)", group: "Suspensão e Direção" },
  { name: "Amortecedores traseiros (par)", group: "Suspensão e Direção" },
  { name: "Molas dianteiras (par)", group: "Suspensão e Direção" },
  { name: "Molas traseiras (par)", group: "Suspensão e Direção" },
  { name: "Bandeja dianteira esquerda", group: "Suspensão e Direção" },
  { name: "Bandeja dianteira direita", group: "Suspensão e Direção" },
  { name: "Manga de eixo esquerda", group: "Suspensão e Direção" },
  { name: "Manga de eixo direita", group: "Suspensão e Direção" },
  { name: "Cubos de roda dianteiros (par)", group: "Suspensão e Direção" },
  { name: "Cubos de roda traseiros (par)", group: "Suspensão e Direção" },
  { name: "Eixo traseiro completo", group: "Suspensão e Direção" },
  { name: "Barra estabilizadora", group: "Suspensão e Direção" },
  { name: "Agregado / quadro do motor", group: "Suspensão e Direção" },
  { name: "Caixa de direção", group: "Suspensão e Direção" },
  { name: "Bomba de direção hidráulica", group: "Suspensão e Direção" },
  { name: "Coluna de direção", group: "Suspensão e Direção" },
  { name: "Terminais de direção (par)", group: "Suspensão e Direção" },
  { name: "Feixes de mola traseiros (par)", group: "Suspensão e Direção", bodies: ["PICAPE", "UTILITARIO"] },

  // ---------------- FREIOS ----------------
  { name: "Servo freio (hidrovácuo)", group: "Freios" },
  { name: "Cilindro mestre de freio", group: "Freios" },
  { name: "Pinça de freio dianteira esquerda", group: "Freios" },
  { name: "Pinça de freio dianteira direita", group: "Freios" },
  { name: "Discos de freio dianteiros (par)", group: "Freios" },
  { name: "Tambores / discos traseiros (par)", group: "Freios" },
  { name: "Alavanca do freio de mão", group: "Freios" },
  { name: "Módulo ABS", group: "Freios" },

  // ---------------- ELÉTRICA E INJEÇÃO ----------------
  { name: "Módulo de injeção (ECU)", group: "Elétrica e Injeção" },
  { name: "Chicote do motor", group: "Elétrica e Injeção" },
  { name: "Chicote principal", group: "Elétrica e Injeção" },
  { name: "Caixa de fusíveis", group: "Elétrica e Injeção" },
  { name: "Painel de instrumentos", group: "Elétrica e Injeção" },
  { name: "Comutador de ignição com chave", group: "Elétrica e Injeção" },
  { name: "Chave de seta e limpador", group: "Elétrica e Injeção" },
  { name: "Botões de vidro elétrico (jogo)", group: "Elétrica e Injeção" },
  { name: "Motor do limpador dianteiro", group: "Elétrica e Injeção" },
  { name: "Motor do limpador traseiro", group: "Elétrica e Injeção", bodies: ["HATCH", "PERUA", "SUV", "UTILITARIO"] },
  { name: "Bobina de ignição", group: "Elétrica e Injeção" },
  { name: "Sonda lambda", group: "Elétrica e Injeção" },
  { name: "Buzina", group: "Elétrica e Injeção" },
  { name: "Rádio / central multimídia", group: "Elétrica e Injeção" },
  { name: "Alto-falantes (jogo)", group: "Elétrica e Injeção" },

  // ---------------- ARREFECIMENTO ----------------
  { name: "Radiador", group: "Arrefecimento" },
  { name: "Eletroventilador (ventoinha)", group: "Arrefecimento" },
  { name: "Condensador do ar-condicionado", group: "Arrefecimento" },
  { name: "Reservatório de expansão", group: "Arrefecimento" },
  { name: "Bomba d'água", group: "Arrefecimento" },
  { name: "Válvula termostática", group: "Arrefecimento" },
  { name: "Radiador de ar quente", group: "Arrefecimento" },
  { name: "Caixa de ventilação interna", group: "Arrefecimento" },

  // ---------------- LATARIA E ESTRUTURA ----------------
  { name: "Capô", group: "Lataria e Estrutura" },
  { name: "Para-choque dianteiro", group: "Lataria e Estrutura" },
  { name: "Para-choque traseiro", group: "Lataria e Estrutura" },
  { name: "Paralama dianteiro esquerdo", group: "Lataria e Estrutura" },
  { name: "Paralama dianteiro direito", group: "Lataria e Estrutura" },
  { name: "Porta dianteira esquerda", group: "Lataria e Estrutura" },
  { name: "Porta dianteira direita", group: "Lataria e Estrutura" },
  { name: "Porta traseira esquerda", group: "Lataria e Estrutura", minDoors: 4 },
  { name: "Porta traseira direita", group: "Lataria e Estrutura", minDoors: 4 },
  { name: "Tampa do porta-malas", group: "Lataria e Estrutura", bodies: ["SEDAN"] },
  { name: "Tampa traseira", group: "Lataria e Estrutura", bodies: ["HATCH", "PERUA", "SUV", "UTILITARIO"] },
  { name: "Tampa da caçamba", group: "Lataria e Estrutura", bodies: ["PICAPE"] },
  { name: "Lateral da caçamba esquerda", group: "Lataria e Estrutura", bodies: ["PICAPE"] },
  { name: "Lateral da caçamba direita", group: "Lataria e Estrutura", bodies: ["PICAPE"] },
  { name: "Santo antônio", group: "Lataria e Estrutura", bodies: ["PICAPE"] },
  { name: "Estribos (par)", group: "Lataria e Estrutura", bodies: ["PICAPE", "SUV"] },
  { name: "Teto", group: "Lataria e Estrutura" },
  { name: "Painel frontal (travessa do radiador)", group: "Lataria e Estrutura" },
  { name: "Grade dianteira", group: "Lataria e Estrutura" },

  // ---------------- VIDROS E RETROVISORES ----------------
  { name: "Para-brisa", group: "Vidros e Retrovisores" },
  { name: "Vidro traseiro (vigia)", group: "Vidros e Retrovisores" },
  { name: "Vidro de porta dianteira esquerda", group: "Vidros e Retrovisores" },
  { name: "Vidro de porta dianteira direita", group: "Vidros e Retrovisores" },
  { name: "Vidro de porta traseira esquerda", group: "Vidros e Retrovisores", minDoors: 4 },
  { name: "Vidro de porta traseira direita", group: "Vidros e Retrovisores", minDoors: 4 },
  { name: "Vidros fixos laterais (par)", group: "Vidros e Retrovisores", bodies: ["HATCH", "PERUA", "SUV", "UTILITARIO"] },
  { name: "Retrovisor externo esquerdo", group: "Vidros e Retrovisores" },
  { name: "Retrovisor externo direito", group: "Vidros e Retrovisores" },
  { name: "Retrovisor interno", group: "Vidros e Retrovisores" },
  { name: "Máquina de vidro dianteira esquerda", group: "Vidros e Retrovisores" },
  { name: "Máquina de vidro dianteira direita", group: "Vidros e Retrovisores" },
  { name: "Máquina de vidro traseira esquerda", group: "Vidros e Retrovisores", minDoors: 4 },
  { name: "Máquina de vidro traseira direita", group: "Vidros e Retrovisores", minDoors: 4 },

  // ---------------- ILUMINAÇÃO ----------------
  { name: "Farol esquerdo", group: "Iluminação" },
  { name: "Farol direito", group: "Iluminação" },
  { name: "Lanterna traseira esquerda", group: "Iluminação" },
  { name: "Lanterna traseira direita", group: "Iluminação" },
  { name: "Setas dianteiras (par)", group: "Iluminação" },
  { name: "Faróis de milha (par)", group: "Iluminação" },
  { name: "Lanterna de placa", group: "Iluminação" },
  { name: "Brake light (terceira luz de freio)", group: "Iluminação" },

  // ---------------- INTERIOR E ACABAMENTO ----------------
  { name: "Banco do motorista", group: "Interior e Acabamento" },
  { name: "Banco do passageiro", group: "Interior e Acabamento" },
  { name: "Banco traseiro", group: "Interior e Acabamento" },
  { name: "Jogo de forros de porta", group: "Interior e Acabamento" },
  { name: "Painel (torpedo)", group: "Interior e Acabamento" },
  { name: "Console central", group: "Interior e Acabamento" },
  { name: "Volante", group: "Interior e Acabamento" },
  { name: "Carpete do assoalho", group: "Interior e Acabamento" },
  { name: "Forro do teto", group: "Interior e Acabamento" },
  { name: "Maçanetas internas (jogo)", group: "Interior e Acabamento" },
  { name: "Maçanetas externas (jogo)", group: "Interior e Acabamento" },
  { name: "Fechaduras de porta (jogo)", group: "Interior e Acabamento" },
  { name: "Comando do ar / ventilação", group: "Interior e Acabamento" },
  { name: "Quebra-sóis (par)", group: "Interior e Acabamento" },
  { name: "Porta-luvas", group: "Interior e Acabamento" },
  { name: "Tampão do porta-malas", group: "Interior e Acabamento", bodies: ["HATCH", "PERUA", "SUV"] },

  // ---------------- RODAS E PNEUS ----------------
  { name: "Jogo de rodas de aço", group: "Rodas e Pneus" },
  { name: "Jogo de rodas de liga leve", group: "Rodas e Pneus" },
  { name: "Estepe", group: "Rodas e Pneus" },
  { name: "Calotas (jogo)", group: "Rodas e Pneus" },
  { name: "Macaco e chave de roda", group: "Rodas e Pneus" },

  // ---------------- ACESSÓRIOS E OUTROS ----------------
  { name: "Tanque de combustível", group: "Acessórios e Outros" },
  { name: "Escapamento completo", group: "Acessórios e Outros" },
  { name: "Catalisador", group: "Acessórios e Outros" },
  { name: "Hastes e palhetas do limpador (par)", group: "Acessórios e Outros" },
  { name: "Antena", group: "Acessórios e Outros" },
  { name: "Rack de teto", group: "Acessórios e Outros", bodies: ["PERUA", "SUV"] },
  { name: "Engate de reboque", group: "Acessórios e Outros" },
  { name: "Protetor de caçamba", group: "Acessórios e Outros", bodies: ["PICAPE"] },
  { name: "Capota marítima", group: "Acessórios e Outros", bodies: ["PICAPE"] },
  { name: "Chave / telecomando", group: "Acessórios e Outros" },
];
