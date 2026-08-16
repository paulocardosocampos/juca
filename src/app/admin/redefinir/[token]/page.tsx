import Link from "next/link";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { JucaLogo } from "@/components/logo";
import { ResetForm } from "@/components/admin/reset-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Criar nova senha" };

// Página aberta (fora do /admin protegido): quem chega aqui não tem sessão,
// justamente porque perdeu o acesso. O token do link é a credencial.
export default async function ResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await prisma.user.findFirst({
    where: {
      resetTokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      resetTokenExp: { gt: new Date() },
    },
    select: { name: true, username: true },
  });

  return (
    <div className="min-h-screen glow-gold flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <JucaLogo priority className="h-20 w-auto mb-8" />

        {user ? (
          <>
            <h1 className="display text-[24px]">Criar nova senha</h1>
            <p className="text-[13px] text-white/40 mt-2">
              Olá, {user.name}. Escolha a senha que você vai usar para entrar como{" "}
              <b className="text-white/70">{user.username}</b>.
            </p>
            <ResetForm token={token} />
          </>
        ) : (
          <>
            <h1 className="display text-[24px]">Link inválido ou expirado</h1>
            <p className="text-[13px] text-white/40 mt-2 leading-relaxed">
              Este link já foi usado ou passou da validade. Peça um novo ao
              responsável pelo sistema.
            </p>
            <Link
              href="/admin/login"
              className="inline-block mt-6 rounded-lg border border-white/15 hover:border-white/35 text-[12px] font-bold tracking-[0.1em] uppercase px-6 py-3.5 transition-colors"
            >
              Ir para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
