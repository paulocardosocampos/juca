import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { parsePhotos, vehicleTitle } from "@/lib/format";
import { PART_GROUPS } from "@/lib/constants";
import { PartCard } from "@/components/site/cards";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Catálogo de peças",
  description:
    "Peças usadas com procedência de desmanche legalizado DETRAN: motor, câmbio, lataria, faróis, suspensão e mais.",
};

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-3 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-flame";

export default async function PartsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ marca?: string; grupo?: string; q?: string; veiculo?: string }>;
}) {
  const { marca, grupo, q, veiculo } = await searchParams;

  const where: Prisma.PartWhereInput = { status: "DISPONIVEL" };
  if (grupo && (PART_GROUPS as readonly string[]).includes(grupo)) where.group = grupo;
  if (q?.trim()) where.name = { contains: q.trim() };
  if (veiculo) where.vehicleId = veiculo;
  else if (marca) where.vehicle = { brand: marca };

  const [parts, brands, vehicleFilter] = await Promise.all([
    prisma.part.findMany({
      where,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: 120,
      select: {
        id: true,
        name: true,
        price: true,
        featured: true,
        photos: true,
        group: true,
        vehicle: { select: { brand: true, model: true, modelYear: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: { parts: { some: { status: "DISPONIVEL" } } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    veiculo
      ? prisma.vehicle.findUnique({
          where: { id: veiculo },
          select: { brand: true, model: true, modelYear: true },
        })
      : null,
  ]);

  return (
    <main className="pt-16">
      <div className="glow-flame border-b border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-flame mb-3">
            Estoque disponível
          </p>
          <h1 className="display text-[clamp(28px,4.4vw,52px)]">Catálogo de peças</h1>
          <p className="mt-4 text-[14px] text-white/45 max-w-lg leading-relaxed">
            Todas com procedência de desmanche legalizado. Não achou o que precisa? O estoque muda
            todo dia — chame no WhatsApp.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10">
        <form className="rounded-xl border border-white/8 bg-surface p-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.6fr_auto] lg:items-end mb-6">
          <div>
            <label
              htmlFor="f-marca"
              className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
            >
              Marca
            </label>
            <select id="f-marca" name="marca" defaultValue={marca ?? ""} className={FIELD}>
              <option value="">Todas</option>
              {brands.map((b) => (
                <option key={b.brand}>{b.brand}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="f-grupo"
              className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
            >
              Conjunto
            </label>
            <select id="f-grupo" name="grupo" defaultValue={grupo ?? ""} className={FIELD}>
              <option value="">Todos</option>
              {PART_GROUPS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="f-q"
              className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
            >
              Buscar
            </label>
            <input
              id="f-q"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Farol, câmbio, porta..."
              className={FIELD}
            />
          </div>
          <button className="rounded-lg bg-flame hover:bg-flame-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase px-7 py-3.5 transition-colors cursor-pointer">
            Filtrar
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <p className="text-[12px] text-white/35">
            {parts.length} {parts.length === 1 ? "peça encontrada" : "peças encontradas"}
          </p>
          {vehicleFilter && (
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold bg-flame/12 border border-flame/30 text-flame rounded-full px-3 py-1.5">
              Peças do {vehicleTitle(vehicleFilter)}
              <Link href="/pecas" className="hover:text-white" title="Limpar filtro">
                ✕
              </Link>
            </span>
          )}
        </div>

        {parts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {parts.map((p) => (
              <PartCard key={p.id} part={{ ...p, photos: parsePhotos(p.photos) }} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-surface p-16 text-center">
            <p className="display text-lg text-white">Nenhuma peça com esses filtros</p>
            <p className="text-[13px] text-white/40 mt-2 max-w-sm mx-auto leading-relaxed">
              O estoque muda todo dia e nem tudo está catalogado ainda. Fale com a gente que
              procuramos para você.
            </p>
            <Link
              href="/pecas"
              className="inline-block mt-6 rounded-lg border border-white/15 hover:border-white/35 text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3 transition-colors"
            >
              Limpar filtros
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
