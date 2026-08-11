import { PARTS_CATALOG, type PartTemplate } from "./parts-catalog";
import type { BodyType, Transmission } from "./constants";

export interface VehicleAttrs {
  doors: number;
  body: BodyType;
  transmission: Transmission;
}

// Gera o checklist de peças de um veículo a partir do catálogo-gabarito,
// aplicando as regras condicionais (portas, carroceria, câmbio).
export function generatePartsChecklist(attrs: VehicleAttrs): PartTemplate[] {
  return PARTS_CATALOG.filter((t) => {
    if (t.minDoors && attrs.doors < t.minDoors) return false;
    if (t.bodies && !t.bodies.includes(attrs.body)) return false;
    if (t.transmission && t.transmission !== attrs.transmission) return false;
    return true;
  });
}
