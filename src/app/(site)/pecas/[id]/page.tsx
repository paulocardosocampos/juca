import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatBRL, parsePhotos, vehicleTitle } from "@/lib/format";
import { partInterestMessage, whatsappLink } from "@/lib/whatsapp";
import { BODY_TYPES } from "@/lib/constants";
import { PartCard, PhotoFrame } from "@/components/site/cards";

export const dynamic = "force-dynamic";

// Consulta pública: só campos seguros do veículo (nada de leilão).
async function getPart(id: string) {
  return prisma.part.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      group: true,
      status: true,
      price: true,
      description: true,
      photos: true,
      mlLink: true,
      featured: true,
      quantity: true,
      vehicle: {
        select: {
          id: true,
          brand: true,
          model: true,
          modelYear: true,
          engine: true,
          engineFamily: true,
          doors: true,
          body: true,
          color: true,
          fuel: true,
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
  const part = await getPart(id);
  if (!part) return { title: "Peça não encontrada" };
  return {
    title: `${part.name} — ${vehicleTitle(part.vehicle)}`,
    description: `${part.name} usada com procedência, do ${vehicleTitle(part.vehicle)}. Desmanche legalizado DETRAN em Bariri/SP.`,
  };
}

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [part, settings] = await Promise.all([getPart(id), getSettings()]);
  if (!part) notFound();

  const available = part.status === "DISPONIVEL";
  const photos = parsePhotos(part.photos);
  const wa = whatsappLink(settings.whatsapp, partInterestMessage(part));
  const bodyLabel =
    BODY_TYPES.find((b) => b.value === part.vehicle.body)?.label ?? part.vehicle.body;

  const specs = [
    ["Veículo de origem", vehicleTitle(part.vehicle)],
    ["Motor", part.vehicle.engine ?? "—"],
    ["Família do motor", part.vehicle.engineFamily ?? "—"],
    ["Carroceria", `${bodyLabel} · ${part.vehicle.doors} portas`],
    ["Combustível", part.vehicle.fuel ?? "—"],
    ["Cor", part.vehicle.color ?? "—"],
  ] as const;

  const related = await prisma.part.findMany({
    where: { vehicleId: part.vehicle.id, status: "DISPONIVEL", id: { not: part.id } },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: 4,
    select: {
      id: true,
      name: true,
      price: true,
      featured: true,
      photos: true,
      vehicle: { select: { brand: true, model: true, modelYear: true } },
    },
  });

  return (
    <main className="pt-16">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <nav className="text-[11px] text-white/30 mb-8">
          <Link href="/" className="hover:text-flame transition-colors">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/pecas" className="hover:text-flame transition-colors">
            Peças
          </Link>
          <span className="mx-2">/</span>
          <span className="text-white/55">{part.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Galeria */}
          <div className="space-y-3">
            <PhotoFrame
              src={photos[0]}
              alt={part.name}
              className="aspect-[4/3] rounded-xl border border-white/8"
            />
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {photos.slice(1, 5).map((p) => (
                  <PhotoFrame
                    key={p}
                    src={p}
                    alt={part.name}
                    className="aspect-square rounded-lg border border-white/8"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            <Link
              href={`/pecas?grupo=${encodeURIComponent(part.group)}`}
              className="text-[10px] font-bold tracking-[0.2em] uppercase text-flame hover:underline"
            >
              {part.group}
            </Link>
            <h1 className="display text-[clamp(24px,3.6vw,40px)] mt-3">{part.name}</h1>
            <p className="text-[13px] text-white/40 mt-3">
              Retirada do <span className="text-white/70">{vehicleTitle(part.vehicle)}</span>
            </p>

            {available ? (
              <>
                <div className="mt-8 flex items-end gap-4">
                  <p className="display text-[clamp(32px,5vw,52px)] text-white tabular-nums leading-none">
                    {part.price != null ? formatBRL(part.price) : "Consultar"}
                  </p>
                  {part.quantity > 1 && (
                    <p className="text-[11px] text-white/35 pb-2">{part.quantity} unidades</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-7">
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center rounded-lg bg-[#25d366] hover:bg-[#1fbe59] text-base text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-4 transition-colors"
                  >
                    Tenho interesse
                  </a>
                  {part.mlLink && (
                    <a
                      href={part.mlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center rounded-lg border border-white/15 hover:border-white/35 text-white text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-4 transition-colors"
                    >
                      Comprar no Mercado Livre
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-8 rounded-xl border border-white/8 bg-surface px-6 py-5">
                <p className="text-[14px] font-bold text-white">Esta peça já foi vendida.</p>
                <p className="text-[13px] text-white/40 mt-1.5 leading-relaxed">
                  O estoque muda todo dia — pode ter outra igual chegando.
                </p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 rounded-lg border border-white/15 hover:border-white/35 text-[11px] font-bold tracking-[0.1em] uppercase px-5 py-3 transition-colors"
                >
                  Perguntar no WhatsApp
                </a>
              </div>
            )}

            {/* Ficha técnica */}
            <dl className="mt-9 rounded-xl border border-white/8 overflow-hidden">
              {specs.map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex justify-between gap-4 px-5 py-3.5 text-[13px] ${
                    i % 2 === 0 ? "bg-surface" : "bg-base"
                  }`}
                >
                  <dt className="text-white/35">{k}</dt>
                  <dd className="text-white/85 text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            {part.description && (
              <div className="mt-8">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30 mb-3">
                  Observações
                </p>
                <p className="text-[13px] text-white/60 leading-relaxed whitespace-pre-line">
                  {part.description}
                </p>
              </div>
            )}

            <div className="mt-8 rounded-xl border border-flame/25 bg-flame/6 px-5 py-4">
              <p className="text-[12px] text-white/70 leading-relaxed">
                Peça de desmanche <b className="text-white">legalizado pelo DETRAN</b>, com origem
                em leilão oficial.{" "}
                <Link
                  href={`/veiculos/${part.vehicle.id}`}
                  className="text-flame font-semibold hover:underline"
                >
                  Ver todas as peças deste veículo →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="display text-lg mb-6">Mais peças deste veículo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <PartCard key={p.id} part={{ ...p, photos: parsePhotos(p.photos) }} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
