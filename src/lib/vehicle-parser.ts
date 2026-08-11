import type { BodyType, Transmission } from "./constants";

// Extrai atributos técnicos do nome de modelo da FIPE.
// Ex.: "Corsa Sed. Classic Life 1.8 8V Flex 4p" →
//   doors 4, engine "1.8 8V", body SEDAN, transmission MANUAL
export interface ParsedVehicle {
  doors: number;
  engine: string | null;
  body: BodyType;
  transmission: Transmission;
}

const SEDAN_RE = /\bsed(an|\.|a)?\b|classic|siena|voyage|prisma|cobalt|logan|versa|cronos|virtus|polo sed|grand siena/i;
const PICKUP_RE = /pic[ck]-?up|\bcab\.?\b|c\.(dupla|simples)|saveiro|strada|montana|courier|hoggar|s10|s-10|hilux|ranger|l200|amarok|frontier|toro|oroch|pampa|d-?20|f-?1000|f-?250|silverado/i;
const SW_RE = /\bsw\b|weekend|perua|parati|caravan|quantum|marajo|belina|ipanema|fielder|spacefox|golf variant|palio week/i;
const SUV_RE = /ecosport|duster|tracker|creta|hr-?v|wr-?v|compass|renegade|tucson|ix35|sportage|rav-?4|pajero|tr4|sw4|blazer|crossfox|kicks|captur|t-cross|nivus|2008|c4 cactus|aircross|tiguan|santa fe|sorento|outlander|vitara|cherokee|bandeirante|land/i;
const VAN_RE = /kombi|doblo|fiorino|kangoo|partner|berlingo|expert|ducato|sprinter|master|transit|hr\b|bongo|towner|van\b|furg/i;

export function parseFipeModelName(modelName: string): ParsedVehicle {
  const doorsMatch = modelName.match(/(\d)\s*p\b/i);
  const displacement = modelName.match(/\b(\d\.\d)\b/);
  const valves = modelName.match(/\b(8|12|16|20|24)v\b/i);

  let body: BodyType = "HATCH";
  if (PICKUP_RE.test(modelName)) body = "PICAPE";
  else if (VAN_RE.test(modelName)) body = "UTILITARIO";
  else if (SUV_RE.test(modelName)) body = "SUV";
  else if (SW_RE.test(modelName)) body = "PERUA";
  else if (SEDAN_RE.test(modelName)) body = "SEDAN";

  const doubleCab = /\bcd\b|c\.?\s*dupla|cab\.?\s*dupla/i.test(modelName);
  const doors = doorsMatch
    ? parseInt(doorsMatch[1], 10)
    : body === "PICAPE" || body === "UTILITARIO"
      ? doubleCab
        ? 4
        : 2
      : 4;

  const transmission: Transmission = /\baut\b|autom|tiptronic|\bcvt\b|\bat\b/i.test(modelName)
    ? "AUTOMATICO"
    : "MANUAL";

  let engine: string | null = null;
  if (displacement) {
    engine = displacement[1] + (valves ? ` ${valves[1]}V` : "");
  }

  return { doors: Math.min(Math.max(doors, 2), 4), engine, body, transmission };
}
