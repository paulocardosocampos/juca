import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { formatBRL, vehicleTitle } from "@/lib/format";
import { PART_GROUPS, PART_STATUS, type PartStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Peças" };

export default async function PartsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; group?: string; q?: string }>;
}) {
  const { status, group, q } = await searchParams;
  const where: Prisma.PartWhereInput = {};
  if (status && status in PART_STATUS) where.status = status;
  if (group && (PART_GROUPS as readonly string[]).includes(group)) where.group = group;
  if (q?.trim()) where.name = { contains: q.trim() };

  const parts = await prisma.part.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 300,
    include: { vehicle: { select: { id: true, brand: true, model: true, modelYear: true } } },
  });

  const selectCls =
    "rounded-lg border border-white/12 bg-surface px-3 py-2 text-sm outline-none focus:border-flame";

  return (
    <div className="space-y-5 max-w-6xl">
      <div>
        <h1 className="display text-2xl text-white">Peças</h1>
        <p className="text-sm text-white/40">
          Estoque completo de todos os veículos. Clique na peça para editar no veículo.
        </p>
      </div>

      <form className="bg-surface rounded-2xl shadow-card p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1">Status</label>
          <select name="status" defaultValue={status ?? ""} className={selectCls}>
            <option value="">Todos</option>
            {Object.entries(PART_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1">Grupo</label>
          <select name="group" defaultValue={group ?? ""} className={selectCls}>
            <option value="">Todos</option>
            {PART_GROUPS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-44">
          <label className="block text-xs font-semibold text-white/60 mb-1">Buscar</label>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Nome da peça..."
            className={`${selectCls} w-full`}
          />
        </div>
        <button className="text-xs font-bold tracking-[0.08em] uppercase bg-flame hover:bg-flame-400 text-base rounded-lg px-5 py-2.5 cursor-pointer transition-colors">
          Filtrar
        </button>
      </form>

      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white/35 border-b border-white/8">
                <th className="px-5 py-3">Peça</th>
                <th className="px-5 py-3">Veículo</th>
                <th className="px-5 py-3">Grupo</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Preço</th>
                <th className="px-5 py-3">Venda</th>
                <th className="px-5 py-3">ML</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => {
                const meta =
                  PART_STATUS[(p.status as PartStatus) in PART_STATUS ? (p.status as PartStatus) : "AVALIAR"];
                return (
                  <tr key={p.id} className="border-b border-white/8 hover:bg-white/4">
                    <td className="px-5 py-2.5">
                      <Link
                        href={`/admin/veiculos/${p.vehicle.id}`}
                        className="font-semibold text-flame hover:underline"
                      >
                        {p.featured && "⭐ "}
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 text-white/60">{vehicleTitle(p.vehicle)}</td>
                    <td className="px-5 py-2.5 text-white/40 text-xs">{p.group}</td>
                    <td className="px-5 py-2.5">
                      <span className={`text-xs font-semibold rounded-full whitespace-nowrap px-2.5 py-1 ${meta.color}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">{p.price != null ? formatBRL(p.price) : "—"}</td>
                    <td className="px-5 py-2.5 text-signal-info">
                      {p.soldPrice != null ? formatBRL(p.soldPrice) : "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      {p.mlLink ? (
                        <a
                          href={p.mlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-signal-warn font-bold hover:underline"
                        >
                          anúncio ↗
                        </a>
                      ) : (
                        <span className="text-white/30">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {parts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-white/35">
                    Nenhuma peça encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {parts.length === 300 && (
        <p className="text-xs text-white/35">
          Mostrando as 300 peças mais recentes — refine os filtros para ver mais.
        </p>
      )}
    </div>
  );
}
