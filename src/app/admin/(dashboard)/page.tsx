import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL, formatDate, vehicleTitle } from "@/lib/format";
import { VEHICLE_STATUS, type VehicleStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
  accent = "text-white",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface rounded-2xl shadow-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{label}</p>
      <p className={`display text-2xl mt-1 ${accent}`}>{value}</p>
      {hint && <p className="text-xs text-white/35 mt-1">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const [
    vehiclesInYard,
    partsAvailable,
    partsToEvaluate,
    soldAgg,
    investedAgg,
    stockAgg,
    scrapCount,
    recentVehicles,
  ] = await Promise.all([
    prisma.vehicle.count({ where: { status: "DESMANCHE" } }),
    prisma.part.count({ where: { status: "DISPONIVEL" } }),
    prisma.part.count({ where: { status: "AVALIAR" } }),
    prisma.part.aggregate({
      where: { status: "VENDIDA" },
      _count: true,
      _sum: { soldPrice: true },
    }),
    prisma.vehicle.aggregate({ _sum: { purchaseValue: true } }),
    prisma.part.aggregate({
      where: { status: "DISPONIVEL" },
      _sum: { price: true },
    }),
    prisma.part.count({ where: { status: { in: ["SUCATA", "DESCARTE"] } } }),
    prisma.vehicle.findMany({
      orderBy: { arrivedAt: "desc" },
      take: 8,
      include: { parts: { select: { status: true } } },
    }),
  ]);

  const invested = investedAgg._sum.purchaseValue ?? 0;
  const sold = soldAgg._sum.soldPrice ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-2xl text-white">Dashboard</h1>
          <p className="text-sm text-white/40">Visão geral do pátio e das vendas.</p>
        </div>
        <Link
          href="/admin/veiculos/novo"
          className="display text-xs bg-flame hover:bg-flame-400 text-base rounded-xl px-4 py-3 shadow-card transition-colors"
        >
          + Novo veículo arrematado
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Veículos no pátio" value={String(vehiclesInYard)} />
        <StatCard label="Peças à venda" value={String(partsAvailable)} accent="text-signal-ok" />
        <StatCard label="Peças p/ avaliar" value={String(partsToEvaluate)} accent="text-signal-warn" />
        <StatCard
          label="Peças vendidas"
          value={String(soldAgg._count)}
          hint={formatBRL(sold) + " recebidos"}
          accent="text-signal-info"
        />
        <StatCard
          label="Investido em leilões"
          value={formatBRL(invested)}
          accent="text-flame"
        />
        <StatCard
          label="Valor do estoque"
          value={formatBRL(stockAgg._sum.price ?? 0)}
          hint={`${scrapCount} itens p/ sucata ou descarte`}
        />
      </div>

      <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <h2 className="display text-sm text-white">Últimos veículos arrematados</h2>
        </div>
        <div className="overflow-x-auto thin-scroll">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-white/35 border-b border-white/8">
                <th className="px-5 py-3">Veículo</th>
                <th className="px-5 py-3">Chegada</th>
                <th className="px-5 py-3">Leiloeiro</th>
                <th className="px-5 py-3">Arremate</th>
                <th className="px-5 py-3">Avaliação das peças</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentVehicles.map((v) => {
                const total = v.parts.length;
                const evaluated = v.parts.filter((p) => p.status !== "AVALIAR").length;
                const pct = total ? Math.round((evaluated / total) * 100) : 0;
                const st = VEHICLE_STATUS[v.status as VehicleStatus] ?? VEHICLE_STATUS.DESMANCHE;
                return (
                  <tr key={v.id} className="border-b border-white/8 hover:bg-white/4">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/veiculos/${v.id}`}
                        className="font-semibold text-flame hover:underline"
                      >
                        {vehicleTitle(v)}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-white/60">{formatDate(v.arrivedAt)}</td>
                    <td className="px-5 py-3 text-white/60">{v.auctioneer ?? "—"}</td>
                    <td className="px-5 py-3 text-white/60">{formatBRL(v.purchaseValue)}</td>
                    <td className="px-5 py-3 min-w-40">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-raised overflow-hidden">
                          <div
                            className="h-full bg-flame rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40 whitespace-nowrap">
                          {evaluated}/{total}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold rounded-full whitespace-nowrap px-2.5 py-1 ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {recentVehicles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/35">
                    Nenhum veículo cadastrado ainda. Clique em “Novo veículo arrematado”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
