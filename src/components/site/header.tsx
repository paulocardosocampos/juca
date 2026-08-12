"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JucaLogo } from "@/components/logo";

const LINKS = [
  { href: "/", label: "Início", exact: true },
  { href: "/pecas", label: "Peças" },
  { href: "/veiculos", label: "Pátio" },
  { href: "/sobre", label: "Contato" },
];

export function SiteHeader({ whatsappUrl }: { whatsappUrl: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  // No topo a barra é transparente para não cortar o hero 3D; ao rolar,
  // ganha fundo para o texto continuar legível sobre as fotos.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solid || open
          ? "bg-base/80 backdrop-blur-xl border-b border-white/8"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Largura maior que a do conteúdo: em telas grandes o logo fica perto
          da borda, e não puxado para o centro. */}
      <div className="mx-auto w-full max-w-[1720px] px-5 lg:px-9 h-16 lg:h-20 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group shrink-0"
          onClick={() => setOpen(false)}
        >
          <JucaLogo
            priority
            className="h-12 lg:h-16 w-auto transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-0.5 ml-auto">
          {LINKS.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active ? "text-white bg-white/8" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto md:ml-3 text-[11px] font-bold tracking-[0.1em] uppercase px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-400 text-base transition-colors"
        >
          Falar agora
        </a>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden -mr-1 p-2 text-white/70 hover:text-white cursor-pointer"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 13h14" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-white/8 px-5 pb-4 pt-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-3 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
