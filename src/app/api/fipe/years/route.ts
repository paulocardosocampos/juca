import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getYears } from "@/lib/fipe";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const brand = req.nextUrl.searchParams.get("brand");
  const model = req.nextUrl.searchParams.get("model");
  if (!brand || !model) {
    return NextResponse.json({ error: "Parâmetros brand e model obrigatórios" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getYears(brand, model));
  } catch {
    return NextResponse.json({ error: "Falha ao consultar a FIPE" }, { status: 502 });
  }
}
