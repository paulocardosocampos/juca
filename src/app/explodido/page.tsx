import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { whatsappLink } from "@/lib/whatsapp";
import { JucaMascotGhost } from "@/components/mascot";
import { ExplodedViewClient } from "@/components/site/exploded-view-client";
import { MODELS } from "@/lib/exploded-models";
import type { GroupStock } from "@/components/site/exploded-view";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Vista explodida — protótipo",
  description: "Navegação 3D por conjunto mecânico.",
};

export default async function ExplodedPage() {
  const [rows, settings, vehicleCount, partCount] = await Promise.all([
    prisma.part.groupBy({
      by: ["group"],
      where: { status: "DISPONIVEL" },
      _count: { _all: true },
      _min: { price: true },
    }),
    getSettings(),
    prisma.vehicle.count({ where: { status: "DESMANCHE" } }),
    prisma.part.count({ where: { status: "DISPONIVEL" } }),
  ]);

  const stock: Record<string, GroupStock> = {};
  for (const r of rows) {
    stock[r.group] = { count: r._count._all, minPrice: r._min.price };
  }

  const wa = whatsappLink(
    settings.whatsapp,
    "Olá! Vi a vista explodida no site e procuro uma peça.",
  );

  return (
    <div className="bg-[#0b0c0e] text-white min-h-screen">
      {/* Barra superior — marca discreta, sem mascote gigante */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#0b0c0e]/70 border-b border-white/8">
        <div className="mx-auto max-w-7xl px-5 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <JucaMascotGhost className="w-6 h-auto text-[#ff6b1a] opacity-70 group-hover:opacity-100 transition-opacity" />
            <span className="text-[13px] font-bold tracking-[0.14em] uppercase">
              Juca<span className="text-white/35"> · Carros Velhos</span>
            </span>
          </Link>
          <nav className="ml-auto hidden sm:flex items-center gap-1 text-[12px]">
            {[
              { href: "/pecas", label: "Peças" },
              { href: "/veiculos", label: "Pátio" },
              { href: "/sobre", label: "Contato" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-2 rounded-lg text-white/55 hover:text-white hover:bg-white/6 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto sm:ml-0 text-[11px] font-bold tracking-wider uppercase px-4 py-2.5 rounded-lg bg-[#ff6b1a] hover:bg-[#ff8c42] text-[#0b0c0e] transition-colors"
          >
            Falar agora
          </a>
        </div>
      </header>

      {/* Experiência 3D */}
      <ExplodedViewClient stock={stock} />

      {/* Faixa de números */}
      <section className="border-y border-white/8 bg-[#121417]">
        <div className="mx-auto max-w-7xl px-5 py-14 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { n: String(partCount), l: "peças catalogadas à venda" },
            { n: String(vehicleCount), l: "veículos em desmanche agora" },
            { n: "12", l: "conjuntos mecânicos mapeados" },
            { n: "100%", l: "origem em leilão oficial" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-[clamp(28px,4vw,44px)] font-black leading-none text-[#ff6b1a] tabular-nums">
                {s.n}
              </p>
              <p className="mt-2 text-[12px] leading-snug text-white/45">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#ff6b1a] mb-4">
          Do leilão à prateleira
        </p>
        <h2 className="text-[clamp(24px,3.4vw,40px)] font-black uppercase leading-[1.05] max-w-xl">
          Rastreabilidade em cada
          <br />
          peça que sai daqui.
        </h2>
        <div className="grid md:grid-cols-3 gap-px mt-12 bg-white/8 rounded-2xl overflow-hidden">
          {[
            {
              n: "01",
              t: "Arremate registrado",
              d: "Leiloeiro, lote e data ficam gravados no sistema. Dado privado — nunca aparece na loja, mas garante a origem.",
            },
            {
              n: "02",
              t: "Desmonte catalogado",
              d: "O sistema gera o checklist de ~140 peças conforme motor, carroceria, portas e câmbio do veículo. Nada se perde.",
            },
            {
              n: "03",
              t: "Peça com procedência",
              d: "Cada item é avaliado, fotografado e precificado. O que não presta vira sucata e não chega ao cliente.",
            },
          ].map((c) => (
            <div key={c.n} className="bg-[#121417] p-8">
              <p className="text-[11px] font-bold tracking-widest text-[#ff6b1a]">{c.n}</p>
              <h3 className="mt-4 text-[15px] font-bold uppercase tracking-wide">{c.t}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/45">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Créditos das licenças CC-BY — exigência das licenças e sinal de rigor */}
      <footer className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-10 flex flex-wrap gap-x-8 gap-y-3 justify-between items-center">
          <p className="text-[11px] text-white/30">
            © {new Date().getFullYear()} {settings.storeName} · Desmanche legalizado DETRAN ·{" "}
            {settings.city}
          </p>
          <p className="text-[10px] text-white/25 leading-relaxed">
            Modelos 3D:{" "}
            {MODELS.map((m, i) => (
              <span key={m.id}>
                {i > 0 && " · "}
                <a
                  href={m.credit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/60 underline underline-offset-2"
                >
                  {m.credit.author}
                </a>{" "}
                ({m.credit.license})
              </span>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
}
