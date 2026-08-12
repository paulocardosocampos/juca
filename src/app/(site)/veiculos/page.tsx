import { prisma } from "@/lib/prisma";
import { parsePhotos } from "@/lib/format";
import { VehicleCard } from "@/components/site/cards";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Veículos no pátio",
  description:
    "Veículos em desmanche no pátio do Juca Carros Velhos — veja as peças disponíveis de cada um.",
};

export default async function YardPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "DESMANCHE" },
    orderBy: { arrivedAt: "desc" },
    select: {
      id: true,
      brand: true,
      model: true,
      modelYear: true,
      engine: true,
      doors: true,
      color: true,
      photos: true,
      _count: { select: { parts: { where: { status: "DISPONIVEL" } } } },
    },
  });

  return (
    <main className="pt-16 lg:pt-20">
      <div className="glow-gold border-b border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-gold mb-3">
            Em desmanche agora
          </p>
          <h1 className="display text-[clamp(28px,4.4vw,52px)]">Veículos no pátio</h1>
          <p className="mt-4 text-[14px] text-white/45 max-w-lg leading-relaxed">
            Cada veículo vem de leilão oficial e é desmontado aqui, peça por peça. Clique para ver
            o que já está disponível de cada um.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {vehicles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={{
                  ...v,
                  photos: parsePhotos(v.photos),
                  availableCount: v._count.parts,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-surface p-16 text-center">
            <p className="display text-lg text-white">O pátio está sendo reabastecido</p>
            <p className="text-[13px] text-white/40 mt-2 max-w-sm mx-auto leading-relaxed">
              Novos veículos de leilão chegam toda semana. Siga a gente nas redes para saber
              primeiro.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
