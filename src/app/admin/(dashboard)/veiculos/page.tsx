import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL, formatDate, vehicleTitle } from "@/lib/format";
import { VEHICLE_STATUS, type VehicleStatus } from "@/lib/constants";
import { canSeeAuctionData, currentUser } from "@/lib/permissions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Veículos" };

export default async function VehiclesPage() {
  const me = await currentUser();
  const seeAuction = canSeeAuctionData(me);

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { arrivedAt: "desc" },
    include: { parts: { select: { status: true, soldPrice: true } } },
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="display text-2xl text-white">Veículos</h1>
          <p className="text-sm text-white/40">
            {vehicles.length} veículo{vehicles.length === 1 ? "" : "s"} cadastrado
            {vehicles.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/admin/veiculos/novo"
          className="display text-xs bg-gold hover:bg-gold-400 text-base rounded-xl px-4 py-3 shadow-card transition-colors"
        >
          + Novo veículo arrematado
        </Link>
      </div>

      <div className="grid gap-3">
        {vehicles.map((v) => {
          const total = v.parts.length;
          const disp = v.parts.filter((p) => p.status === "DISPONIVEL").length;
          const vendidas = v.parts.filter((p) => p.status === "VENDIDA");
          const aval = v.parts.filter((p) => p.status === "AVALIAR").length;
          const receita = vendidas.reduce((s, p) => s + (p.soldPrice ?? 0), 0);
          const st = VEHICLE_STATUS[v.status as VehicleStatus] ?? VEHICLE_STATUS.DESMANCHE;
          return (
            <Link
              key={v.id}
              href={`/admin/veiculos/${v.id}`}
              className="bg-surface rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <div className="min-w-52 flex-1">
                <p className="font-bold text-white">{vehicleTitle(v)}</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {v.engine ?? "motor n/d"} · {v.doors}p · chegou {formatDate(v.arrivedAt)}
                  {seeAuction && v.auctioneer ? ` · ${v.auctioneer}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-4 text-center text-xs">
                <div>
                  <p className="display text-base text-signal-ok">{disp}</p>
                  <p className="text-white/35">à venda</p>
                </div>
                <div>
                  <p className="display text-base text-signal-info">{vendidas.length}</p>
                  <p className="text-white/35">vendidas</p>
                </div>
                <div>
                  <p className="display text-base text-signal-warn">{aval}</p>
                  <p className="text-white/35">avaliar</p>
                </div>
                <div>
                  <p className="display text-base text-white">{total}</p>
                  <p className="text-white/35">total</p>
                </div>
              </div>
              <div className="text-right text-xs space-y-1 min-w-32">
                {seeAuction && (
                  <p className="text-white/60">
                    Arremate: <b>{formatBRL(v.purchaseValue)}</b>
                  </p>
                )}
                <p className="text-white/60">
                  Vendido: <b className="text-signal-ok">{formatBRL(receita)}</b>
                </p>
                <span className={`inline-block text-xs font-semibold rounded-full whitespace-nowrap px-2.5 py-0.5 ${st.color}`}>
                  {st.label}
                </span>
              </div>
            </Link>
          );
        })}
        {vehicles.length === 0 && (
          <div className="bg-surface rounded-2xl shadow-card p-10 text-center text-white/35">
            Nenhum veículo ainda. Cadastre o primeiro arremate!
          </div>
        )}
      </div>
    </div>
  );
}
