// Cliente da API FIPE (parallelum.com.br) — gratuita, ~500 req/dia.
// Chamadas sempre server-side (via rotas /api/fipe/*) com cache de 24h,
// para não estourar o limite diário nem expor a dependência ao cliente.
const BASE = "https://parallelum.com.br/fipe/api/v1";

export interface FipeRef {
  codigo: string;
  nome: string;
}

export interface FipeVehicle {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
}

async function fipeGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) {
    throw new Error(`FIPE respondeu ${res.status} em ${path}`);
  }
  return res.json() as Promise<T>;
}

export function getBrands(): Promise<FipeRef[]> {
  return fipeGet<FipeRef[]>("/carros/marcas");
}

export function getModels(brandCode: string): Promise<{ modelos: FipeRef[] }> {
  return fipeGet<{ modelos: { codigo: number; nome: string }[] }>(
    `/carros/marcas/${brandCode}/modelos`,
  ).then((r) => ({
    modelos: r.modelos.map((m) => ({ codigo: String(m.codigo), nome: m.nome })),
  }));
}

export function getYears(brandCode: string, modelCode: string): Promise<FipeRef[]> {
  return fipeGet<FipeRef[]>(`/carros/marcas/${brandCode}/modelos/${modelCode}/anos`);
}

export function getVehicle(
  brandCode: string,
  modelCode: string,
  yearCode: string,
): Promise<FipeVehicle> {
  return fipeGet<FipeVehicle>(
    `/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`,
  );
}

export function parseFipeValue(valor: string): number | null {
  // "R$ 12.345,00" → 12345
  const n = Number(valor.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
