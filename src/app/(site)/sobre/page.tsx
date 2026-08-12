import { getSettings } from "@/lib/settings";
import { formatPhone } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sobre e contato",
  description:
    "Conheça o Juca Carros Velhos: desmanche legalizado pelo DETRAN em Bariri/SP. Endereço, telefones e redes sociais.",
};

export default async function AboutPage() {
  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsapp, "Olá! Vim pelo site do Juca Carros Velhos.");
  const socials = [
    { label: "Facebook", url: settings.facebook },
    { label: "Instagram", url: settings.instagram },
    { label: "TikTok", url: settings.tiktok },
    { label: "Mercado Livre", url: settings.mercadoLivre },
  ].filter((s) => s.url);

  return (
    <main className="pt-16 lg:pt-20">
      <div className="glow-gold border-b border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p className="text-[10px] font-bold tracking-[0.24em] uppercase text-gold mb-3">
            Quem somos
          </p>
          <h1 className="display text-[clamp(28px,4.8vw,56px)] max-w-3xl">
            Desmanche legalizado,
            <br />
            peça com procedência.
          </h1>
          <p className="mt-6 text-[15px] leading-relaxed text-white/50 max-w-2xl">
            {settings.about}
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-white/50 max-w-2xl">
            Trabalhamos com <b className="text-white">compra, venda ou troca</b> e enviamos peças
            para todo o Brasil pelo Mercado Livre. Todo veículo que entra no pátio vem de leilão
            oficial e tem baixa registrada no DETRAN — você compra peça usada{" "}
            <b className="text-white">sem risco</b>.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-16 grid lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl border border-white/8 bg-surface hover:border-white/20 transition-colors p-6"
          >
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#25d366]">
              WhatsApp
            </p>
            <p className="display text-xl mt-2">{formatPhone(settings.whatsapp)}</p>
            <p className="text-[12px] text-white/35 mt-1.5">
              Resposta rápida em horário comercial
            </p>
          </a>

          <div className="rounded-xl border border-white/8 bg-surface p-6">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">Telefone</p>
            <p className="display text-xl mt-2">{formatPhone(settings.phone2)}</p>
          </div>

          <div className="rounded-xl border border-white/8 bg-surface p-6">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">Endereço</p>
            <p className="text-[15px] font-semibold mt-2 leading-relaxed">
              {settings.address}
              <span className="block text-white/40 font-normal">{settings.city}</span>
            </p>
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-[12px] font-bold tracking-[0.08em] uppercase text-gold hover:underline"
            >
              Como chegar →
            </a>
          </div>

          {socials.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-surface p-6">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold mb-4">
                Redes sociais
              </p>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-semibold border border-white/12 hover:border-white/30 rounded-full px-4 py-2 text-white/70 hover:text-white transition-colors"
                  >
                    {s.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl overflow-hidden border border-white/8 min-h-96 bg-raised">
          <iframe
            title="Mapa — Desmonte Juca Carros Velhos"
            src="https://www.google.com/maps?q=Desmonte+juca+carros+velhos,+Bariri,+SP&output=embed"
            className="w-full h-full border-0 grayscale-[0.6] contrast-[1.1] brightness-[0.85]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </main>
  );
}
