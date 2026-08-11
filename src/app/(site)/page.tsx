import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { parsePhotos } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { PART_GROUPS } from "@/lib/constants";
import { PartCard, VehicleCard } from "@/components/site/cards";
import { ExplodedViewClient } from "@/components/site/exploded-view-client";
import type { GroupStock } from "@/components/site/exploded-view";

export const dynamic = "force-dynamic";

const FIELD =
  "w-full rounded-lg border border-white/10 bg-raised px-3.5 py-3 text-[13px] text-white placeholder:text-white/25 outline-none transition-colors focus:border-flame";

export default async function HomePage() {
  const [
    settings,
    featuredParts,
    recentVehicles,
    brands,
    partCount,
    vehicleCount,
    soldCount,
    groupRows,
  ] = await Promise.all([
    getSettings(),
    prisma.part.findMany({
      where: { status: "DISPONIVEL" },
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      take: 8,
      select: {
        id: true,
        name: true,
        price: true,
        featured: true,
        photos: true,
        vehicle: { select: { brand: true, model: true, modelYear: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: { status: "DESMANCHE" },
      orderBy: { arrivedAt: "desc" },
      take: 3,
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
    }),
    prisma.vehicle.findMany({
      where: { parts: { some: { status: "DISPONIVEL" } } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.part.count({ where: { status: "DISPONIVEL" } }),
    prisma.vehicle.count({ where: { status: "DESMANCHE" } }),
    prisma.part.count({ where: { status: "VENDIDA" } }),
    prisma.part.groupBy({
      by: ["group"],
      where: { status: "DISPONIVEL" },
      _count: { _all: true },
      _min: { price: true },
    }),
  ]);

  const stock: Record<string, GroupStock> = {};
  for (const r of groupRows) {
    stock[r.group] = { count: r._count._all, minPrice: r._min.price };
  }

  const wa = whatsappLink(
    settings.whatsapp,
    "Olá! Vim pelo site do Juca Carros Velhos e procuro uma peça.",
  );

  return (
    <main>
      {/* ---------- HERO: vista explodida interativa ---------- */}
      <ExplodedViewClient stock={stock} />

      {/* ---------- BUSCA ---------- */}
      <section className="border-y border-white/8 bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-8">
          <form
            action="/pecas"
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.6fr_auto] lg:items-end"
          >
            <div>
              <label
                htmlFor="h-marca"
                className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
              >
                Marca do carro
              </label>
              <select id="h-marca" name="marca" className={FIELD}>
                <option value="">Todas as marcas</option>
                {brands.map((b) => (
                  <option key={b.brand}>{b.brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="h-grupo"
                className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
              >
                Conjunto
              </label>
              <select id="h-grupo" name="grupo" className={FIELD}>
                <option value="">Todos os conjuntos</option>
                {PART_GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="h-q"
                className="block text-[10px] font-bold tracking-[0.16em] uppercase text-white/35 mb-2"
              >
                O que você procura?
              </label>
              <input
                id="h-q"
                name="q"
                placeholder="Farol, câmbio, porta, cabeçote..."
                className={FIELD}
              />
            </div>
            <button className="rounded-lg bg-flame hover:bg-flame-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase px-7 py-3.5 transition-colors cursor-pointer">
              Buscar
            </button>
          </form>
        </div>
      </section>

      {/* ---------- NÚMEROS ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { n: String(partCount), l: "peças à venda agora" },
          { n: String(vehicleCount), l: "veículos em desmanche" },
          { n: String(soldCount), l: "peças já entregues" },
          { n: "100%", l: "origem em leilão oficial" },
        ].map((s) => (
          <div key={s.l}>
            <p className="display text-[clamp(30px,4.4vw,48px)] text-flame tabular-nums">{s.n}</p>
            <p className="mt-2 text-[12px] leading-snug text-white/40">{s.l}</p>
          </div>
        ))}
      </section>

      {/* ---------- DESTAQUES ---------- */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-flame mb-3">
              Saiu do pátio
            </p>
            <h2 className="display text-[clamp(22px,3vw,34px)]">Peças em destaque</h2>
          </div>
          <Link
            href="/pecas"
            className="text-[12px] font-semibold text-white/50 hover:text-flame transition-colors whitespace-nowrap"
          >
            ver catálogo completo →
          </Link>
        </div>
        {featuredParts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredParts.map((p) => (
              <PartCard key={p.id} part={{ ...p, photos: parsePhotos(p.photos) }} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/8 bg-surface p-12 text-center text-white/40 text-sm">
            Estamos abastecendo o estoque — chame no WhatsApp que a peça pode já estar aqui.
          </div>
        )}
      </section>

      {/* ---------- RECÉM-CHEGADOS ---------- */}
      {recentVehicles.length > 0 && (
        <section className="border-y border-white/8 bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <div className="flex items-end justify-between gap-4 mb-7">
              <div>
                <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-flame mb-3">
                  Chegou agora
                </p>
                <h2 className="display text-[clamp(22px,3vw,34px)]">Últimos no pátio</h2>
              </div>
              <Link
                href="/veiculos"
                className="text-[12px] font-semibold text-white/50 hover:text-flame transition-colors whitespace-nowrap"
              >
                ver o pátio →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentVehicles.map((v) => (
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
          </div>
        </section>
      )}

      {/* ---------- CONFIANÇA ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-flame mb-3">
          Por que comprar aqui
        </p>
        <h2 className="display text-[clamp(22px,3.2vw,38px)] max-w-2xl">
          Peça usada não precisa ser aposta.
        </h2>
        <div className="grid md:grid-cols-3 gap-px mt-12 bg-white/8 rounded-xl overflow-hidden">
          {[
            {
              n: "01",
              t: "Legalizado no DETRAN",
              d: "Desmanche registrado. Todo veículo vem de leilão oficial com baixa regularizada — a peça que você leva tem origem rastreável.",
            },
            {
              n: "02",
              t: "Avaliada antes de vender",
              d: "Cada item passa por conferência e é fotografado. O que não presta vira sucata e nunca chega à sua mão.",
            },
            {
              n: "03",
              t: "Do seu jeito",
              d: "Negocie pelo WhatsApp, compre pelo Mercado Livre ou retire em Bariri. Trabalhamos com compra, venda e troca.",
            },
          ].map((c) => (
            <div key={c.n} className="bg-base p-8">
              <p className="text-[11px] font-bold tracking-[0.16em] text-flame">{c.n}</p>
              <h3 className="mt-5 text-[15px] font-bold uppercase tracking-wide">{c.t}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- LOCALIZAÇÃO ---------- */}
      <section className="border-t border-white/8 bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-flame mb-3">
              Onde estamos
            </p>
            <h2 className="display text-[clamp(22px,3.2vw,38px)]">Venha até o pátio</h2>
            <p className="mt-5 text-[14px] leading-relaxed text-white/45 max-w-md">
              {settings.about}
            </p>
            <p className="mt-6 text-[14px] font-semibold text-white">
              {settings.address}
              <span className="block text-white/40 font-normal mt-0.5">{settings.city}</span>
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-flame hover:bg-flame-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3.5 transition-colors"
              >
                Como chegar
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 hover:border-white/35 text-white text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3.5 transition-colors"
              >
                Chamar no WhatsApp
              </a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/8 aspect-[4/3] lg:aspect-video bg-raised">
            <iframe
              title="Mapa — Desmonte Juca Carros Velhos"
              src="https://www.google.com/maps?q=Desmonte+juca+carros+velhos,+Bariri,+SP&output=embed"
              className="w-full h-full border-0 grayscale-[0.6] contrast-[1.1] brightness-[0.85]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
