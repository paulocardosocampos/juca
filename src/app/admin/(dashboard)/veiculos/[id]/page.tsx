import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL, formatDate, parsePhotos, vehicleTitle } from "@/lib/format";
import { BODY_TYPES, VEHICLE_STATUS, type VehicleStatus } from "@/lib/constants";
import { PartsChecklist, type PartData } from "@/components/admin/parts-checklist";
import { VehicleEdit } from "@/components/admin/vehicle-edit";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { setVehiclePhotos } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { parts: { orderBy: { name: "asc" } } },
  });
  if (!vehicle) notFound();

  const revenue = vehicle.parts
    .filter((p) => p.status === "VENDIDA")
    .reduce((s, p) => s + (p.soldPrice ?? 0), 0);
  const stockValue = vehicle.parts
    .filter((p) => p.status === "DISPONIVEL")
    .reduce((s, p) => s + (p.price ?? 0), 0);
  const result = revenue - (vehicle.purchaseValue ?? 0);
  const st = VEHICLE_STATUS[vehicle.status as VehicleStatus] ?? VEHICLE_STATUS.DESMANCHE;
  const bodyLabel =
    BODY_TYPES.find((b) => b.value === vehicle.body)?.label ?? vehicle.body;

  const parts: PartData[] = vehicle.parts.map((p) => ({
    id: p.id,
    name: p.name,
    group: p.group,
    quantity: p.quantity,
    status: p.status,
    price: p.price,
    soldPrice: p.soldPrice,
    description: p.description,
    mlLink: p.mlLink,
    featured: p.featured,
    photos: parsePhotos(p.photos),
  }));

  const chips = [
    bodyLabel,
    `${vehicle.doors} portas`,
    vehicle.engine,
    vehicle.engineFamily,
    vehicle.transmission === "AUTOMATICO" ? "Automático" : "Manual",
    vehicle.fuel,
    vehicle.color,
    vehicle.fipeCode ? `FIPE ${vehicle.fipeCode}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="bg-surface rounded-2xl shadow-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="display text-xl text-white">{vehicleTitle(vehicle)}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {chips.map((c) => (
                <span
                  key={c}
                  className="text-xs font-semibold bg-base border border-white/8 rounded-full px-2.5 py-1 text-white/60"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
          <span className={`text-xs font-semibold rounded-full whitespace-nowrap px-3 py-1.5 ${st.color}`}>
            {st.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div className="rounded-xl bg-base border border-white/8 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-white/35">Arremate</p>
            <p className="display text-lg text-gold">{formatBRL(vehicle.purchaseValue)}</p>
            <p className="text-[11px] text-white/35">
              {vehicle.auctioneer ?? "leiloeiro n/d"}
              {vehicle.lotNumber ? ` · lote ${vehicle.lotNumber}` : ""} ·{" "}
              {formatDate(vehicle.auctionDate)}
            </p>
          </div>
          <div className="rounded-xl bg-base border border-white/8 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-white/35">Já vendido</p>
            <p className="display text-lg text-signal-info">{formatBRL(revenue)}</p>
          </div>
          <div className="rounded-xl bg-base border border-white/8 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-white/35">Estoque à venda</p>
            <p className="display text-lg text-signal-ok">{formatBRL(stockValue)}</p>
          </div>
          <div className="rounded-xl bg-base border border-white/8 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-white/35">Resultado parcial</p>
            <p className={`display text-lg ${result >= 0 ? "text-signal-ok" : "text-signal-bad"}`}>
              {formatBRL(result)}
            </p>
            <p className="text-[11px] text-white/35">vendas − arremate</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold text-white/60 mb-2">Fotos do veículo</p>
          <PhotoUploader
            photos={parsePhotos(vehicle.photos)}
            saveAction={setVehiclePhotos.bind(null, vehicle.id)}
          />
        </div>
      </div>

      <VehicleEdit
        vehicle={{
          id: vehicle.id,
          color: vehicle.color,
          engine: vehicle.engine,
          engineFamily: vehicle.engineFamily,
          status: vehicle.status,
          auctioneer: vehicle.auctioneer,
          auctionName: vehicle.auctionName,
          lotNumber: vehicle.lotNumber,
          auctionDate: vehicle.auctionDate
            ? vehicle.auctionDate.toISOString().slice(0, 10)
            : null,
          purchaseValue: vehicle.purchaseValue,
          auctionNotes: vehicle.auctionNotes,
        }}
      />

      <div>
        <h2 className="display text-base text-white mb-3">
          Checklist de peças{" "}
          <span className="text-xs font-normal normal-case text-white/35">
            ({parts.length} itens gerados para {bodyLabel.toLowerCase()} {vehicle.doors} portas)
          </span>
        </h2>
        <PartsChecklist vehicleId={vehicle.id} parts={parts} />
      </div>
    </div>
  );
}
