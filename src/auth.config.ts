import type { NextAuthConfig } from "next-auth";

// Configuração edge-safe (sem Prisma) — usada também pelo middleware.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminArea = pathname.startsWith("/admin");
      // A tela de redefinição precisa ser aberta: quem chega nela justamente
      // não tem como entrar. O token do link é a credencial.
      const isPublicAdmin =
        pathname.startsWith("/admin/login") || pathname.startsWith("/admin/redefinir");
      if (!isAdminArea || isPublicAdmin) return true;
      return !!auth?.user;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
