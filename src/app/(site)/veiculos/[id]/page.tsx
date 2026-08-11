import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { parsePhotos, vehicleTitle } from "@/lib/format";
import { vehicleInterestMessage, whatsappLink } from "@/lib/whatsapp";
import { BODY_TYPES, PART_GROUPS } from "@/lib/constants";
import { PartCard, PhotoFrame } from "@/components/site/cards";

export const dynamic = "force-dynamic";

// Consulta pública: apenas campos seguros (nunca dados de leilão).
async function getVehicle(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    select: {
      id: true,
      brand: true,
      model: true,
      modelYear: true,
      fuel: true,
      engine: true,
      engineFamily: true,
      doors: true,
      body: true,
      transmission: true,
      color: true,
      photos: true,
      status: true,
      parts: {
        where: { status: "DISPONIVEL" },
        orderBy: [{ featured: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          group: true,
          price: true,
          featured: true,
          photos: true,
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = await getVehicle(id);
  if (!v) return { title: "Veículo não encontrado" };
  return {
    title: `Peças do ${vehicleTitle(v)}`,
    description: `${v.parts.length} peças disponíveis do ${vehicleTitle(v)} em desmanche legalizado DETRAN — Bariri/SP.`,
  };
}

export default async function VehiclePublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [vehicle, settings] = await Promise.all([getVehicle(id), getSettings()]);
  if (!vehicle) notFound();

  const photos = parsePhotos(vehicle.photos);
  const wa = whatsappLink(settings.whatsapp, vehicleInterestMessage(vehicle));
  const bodyLabel = BODY_TYPES.find((b) => b.value === vehicle.body)?.label ?? vehicle.body;
  const chips = [
    bodyLabel,
    `${vehicle.doors} portas`,
    vehicle.engine,
    vehicle.engineFamily,
    vehicle.transmission === "AUTOMATICO" ? "Automático" : "Manual",
    vehicle.fuel,
    vehicle.color,
  ].filter(Boolean) as string[];

  const groups = (PART_GROUPS as readonly string[])
    .map((g) => [g, vehicle.parts.filter((p) => p.group === g)] as const)
    .filter(([, parts]) => parts.length > 0);

  return (
    <main className="pt-16">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <nav className="text-[11px] text-white/30 mb-8">
          <Link href="/" className="hover:text-flame transition-colors">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/veiculos" className="hover:text-flame transition-colors">
            Pátio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/55">{vehicleTitle(vehicle)}</span>
        </nav>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-start mb-16">
          <div className="space-y-3">
            <PhotoFrame
              src={photos[0]}
              alt={vehicleTitle(vehicle)}
              className="aspect-[16/10] rounded-xl border border-white/8"
            />
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {photos.slice(1, 5).map((p) => (
                  <PhotoFrame
                    key={p}
                    src={p}
                    alt={vehicleTitle(vehicle)}
                    className="aspect-square rounded-lg border border-white/8"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] uppercase border border-white/12 text-white/70 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-ok" aria-hidden />
              Em desmanche no pátio
            </span>
            <h1 className="display text-[clamp(24px,3.6vw,42px)] mt-4">{vehicleTitle(vehicle)}</h1>

            <div className="flex flex-wrap gap-2 mt-5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="text-[11px] font-medium border border-white/10 bg-surface rounded-full px-3 py-1.5 text-white/60"
                >
                  {c}
                </span>
              ))}
            </div>

            <p className="text-[14px] text-white/50 mt-6 leading-relaxed">
              {vehicle.parts.length > 0 ? (
                <>
                  <b className="text-flame">{vehicle.parts.length} peças disponíveis</b> deste
                  veículo. Não achou a que precisa? Pode estar em avaliação — pergunte para a
                  gente.
                </>
              ) : (
                <>
                  As peças deste veículo ainda estão em avaliação. Chame no WhatsApp e reserve a
                  sua antes de entrar no catálogo.
                </>
              )}
            </p>

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-7 rounded-lg bg-[#25d366] hover:bg-[#1fbe59] text-base text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-4 transition-colors"
            >
              Perguntar sobre este veículo
            </a>
          </div>
        </div>

        {groups.map(([group, parts]) => (
          <section key={group} className="mb-14">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="display text-base whitespace-nowrap">{group}</h2>
              <span className="h-px flex-1 bg-white/8" aria-hidden />
              <span className="text-[11px] text-white/30 tabular-nums">{parts.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {parts.map((p) => (
                <PartCard
                  key={p.id}
                  part={{
                    ...p,
                    photos: parsePhotos(p.photos),
                    vehicle: {
                      brand: vehicle.brand,
                      model: vehicle.model,
                      modelYear: vehicle.modelYear,
                    },
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
