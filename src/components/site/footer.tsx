import Link from "next/link";
import { JucaLogo } from "@/components/logo";
import { formatPhone } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import type { Settings } from "@prisma/client";

export function SiteFooter({ settings }: { settings: Settings }) {
  const socials = [
    { label: "Facebook", url: settings.facebook },
    { label: "Instagram", url: settings.instagram },
    { label: "TikTok", url: settings.tiktok },
    { label: "Mercado Livre", url: settings.mercadoLivre },
  ].filter((s) => s.url);

  return (
    <footer className="mt-auto border-t border-white/8 bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <JucaLogo className="h-20 w-auto" />
          <p className="mt-5 text-[13px] leading-relaxed text-white/40 max-w-xs">
            Desmanche legalizado pelo DETRAN. Compra, venda ou troca — peças usadas com
            procedência de leilão oficial.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] uppercase text-gold border border-gold/30 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />
            Registro DETRAN-SP
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-4">
            Navegação
          </p>
          <ul className="space-y-2.5 text-[13px]">
            {[
              { href: "/pecas", label: "Catálogo de peças" },
              { href: "/veiculos", label: "Veículos no pátio" },
              { href: "/sobre", label: "Sobre e contato" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-white/50 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-4">
            Contato
          </p>
          <ul className="space-y-2.5 text-[13px]">
            <li>
              <a
                href={whatsappLink(settings.whatsapp, "Olá! Vim pelo site do Juca Carros Velhos.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
              >
                {formatPhone(settings.whatsapp)}
              </a>
              <span className="text-white/25"> · WhatsApp</span>
            </li>
            <li className="text-white/50">{formatPhone(settings.phone2)}</li>
            <li>
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors leading-relaxed block"
              >
                {settings.address}
                <br />
                {settings.city}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30 mb-4">
            Redes
          </p>
          <ul className="space-y-2.5 text-[13px]">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {s.label} ↗
                </a>
              </li>
            ))}
            {socials.length === 0 && <li className="text-white/25">Em breve</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/8">
        <div className="mx-auto max-w-7xl px-5 py-6 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/25">
          <p>
            © {new Date().getFullYear()} {settings.storeName} · Desmanche legalizado DETRAN ·{" "}
            {settings.city}
          </p>
          {/* Assinatura do desenvolvedor. Quando o site da PC Mídia Labs
              existir, basta envolver em <a href="..."> — ver README. */}
          <p className="text-white/20">Desenvolvido por PC Mídia Labs</p>
        </div>
      </div>
    </footer>
  );
}
