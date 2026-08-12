"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { JucaLogo } from "@/components/logo";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true, icon: "M3 12h4l2 6 3-13 2 9 2-4h3" },
  { href: "/admin/veiculos", label: "Veículos", icon: "M3 12h14M5 12V8l2-3h6l2 3v4M6 15h1m6 0h1" },
  { href: "/admin/pecas", label: "Peças", icon: "M4 7h5m2 0h5M4 13h5m2 0h5M9 4v6m2 0v6" },
  {
    href: "/admin/config",
    label: "Configurações",
    icon: "M10 7a3 3 0 100 6 3 3 0 000-6M10 2v2m0 12v2m8-8h-2M4 10H2",
  },
];

function Icon({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="w-4 h-4 shrink-0 fill-none stroke-current stroke-[1.6]"
      aria-hidden
    >
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-0.5 px-3">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors border ${
              active
                ? "bg-gold/12 text-gold border-gold/25"
                : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
            }`}
          >
            <Icon d={l.icon} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="px-3 pb-4 space-y-0.5">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Icon d="M4 10h12M11 5l5 5-5 5" />
        Ver a loja
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/40 hover:text-signal-bad hover:bg-signal-bad/8 transition-colors cursor-pointer"
        >
          <Icon d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M13 13l3-3-3-3M16 10H8" />
          Sair
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Barra mobile */}
      <header className="lg:hidden sticky top-0 z-40 bg-base/85 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <JucaLogo className="h-9 w-auto" />
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-white/35">
            Admin
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="p-2 text-white/70 hover:text-white cursor-pointer"
        >
          <svg viewBox="0 0 20 20" className="w-5 h-5 fill-none stroke-current stroke-[1.8]">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 13h14" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </header>
      {open && (
        <div className="lg:hidden bg-surface border-b border-white/8 py-2 sticky top-[53px] z-40">
          {nav}
          {footer}
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-surface border-r border-white/8 min-h-screen sticky top-0 max-h-screen">
        <div className="px-5 py-6">
          <JucaLogo className="h-14 w-auto" />
          <p className="mt-2 text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">
            Área do gestor
          </p>
        </div>
        {nav}
        <div className="px-5 py-4 mt-4 text-[11px] text-white/25 border-t border-white/8">
          Logado como <span className="text-white/60 font-semibold">{userName}</span>
        </div>
        {footer}
      </aside>
    </>
  );
}
