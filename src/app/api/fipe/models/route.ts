import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getModels } from "@/lib/fipe";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const brand = req.nextUrl.searchParams.get("brand");
  if (!brand) return NextResponse.json({ error: "Parâmetro brand obrigatório" }, { status: 400 });
  try {
    const { modelos } = await getModels(brand);
    return NextResponse.json(modelos);
  } catch {
    return NextResponse.json({ error: "Falha ao consultar a FIPE" }, { status: 502 });
  }
}
