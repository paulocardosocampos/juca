import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBrands } from "@/lib/fipe";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    return NextResponse.json(await getBrands());
  } catch {
    return NextResponse.json({ error: "Falha ao consultar a FIPE" }, { status: 502 });
  }
}
