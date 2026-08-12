import Link from "next/link";
import { JucaLogo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="min-h-screen glow-gold flex items-center justify-center px-5">
      <div className="text-center">
        <JucaLogo className="h-20 w-auto mx-auto opacity-70" />
        <p className="display text-[clamp(56px,12vw,120px)] text-white/8 leading-none mt-6">404</p>
        <h1 className="display text-[clamp(20px,3vw,30px)] -mt-4">Página não encontrada</h1>
        <p className="text-[14px] text-white/40 mt-3 max-w-sm mx-auto leading-relaxed">
          Essa já foi pro ferro velho. Mas o pátio continua cheio de coisa boa.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <Link
            href="/"
            className="rounded-lg bg-gold hover:bg-gold-400 text-base text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3.5 transition-colors"
          >
            Voltar ao início
          </Link>
          <Link
            href="/pecas"
            className="rounded-lg border border-white/15 hover:border-white/35 text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3.5 transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
