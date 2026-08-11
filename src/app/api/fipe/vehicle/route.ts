import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getVehicle, parseFipeValue } from "@/lib/fipe";
import { parseFipeModelName } from "@/lib/vehicle-parser";
import { suggestMotorFamily } from "@/lib/motor-families";

// Consulta o veículo na FIPE e devolve também os atributos derivados
// (portas, motor, carroceria, câmbio) + sugestão de família de motor.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const brand = req.nextUrl.searchParams.get("brand");
  const model = req.nextUrl.searchParams.get("model");
  const year = req.nextUrl.searchParams.get("year");
  if (!brand || !model || !year) {
    return NextResponse.json(
      { error: "Parâmetros brand, model e year obrigatórios" },
      { status: 400 },
    );
  }
  try {
    const fipe = await getVehicle(brand, model, year);
    const parsed = parseFipeModelName(fipe.Modelo);
    const engineFamily = suggestMotorFamily(
      fipe.Marca,
      fipe.Modelo,
      fipe.AnoModelo,
      parsed.engine,
    );
    return NextResponse.json({
      fipe: {
        brand: fipe.Marca,
        model: fipe.Modelo,
        modelYear: fipe.AnoModelo,
        fuel: fipe.Combustivel,
        fipeCode: fipe.CodigoFipe,
        fipeValue: parseFipeValue(fipe.Valor),
        reference: fipe.MesReferencia,
      },
      parsed,
      engineFamily,
    });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar a FIPE" }, { status: 502 });
  }
}
